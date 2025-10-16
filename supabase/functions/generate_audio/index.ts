import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GenerateAudioRequest {
  text: string;
  language: string;
  translation_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { text, language, translation_id }: GenerateAudioRequest = await req.json();

    if (!text || !language) {
      throw new Error('Missing required parameters: text and language');
    }

    let audioUrl = '';

    if (googleApiKey) {
      try {
        const languageCode = language === 'zh' ? 'cmn-CN' : language === 'hi' ? 'hi-IN' : `${language}-US`;
        
        const ttsResponse = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text: text },
              voice: {
                languageCode: languageCode,
                ssmlGender: 'NEUTRAL',
              },
              audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.9,
                pitch: 0,
              },
            }),
          }
        );

        const ttsData = await ttsResponse.json();
        
        if (!ttsData.audioContent) {
          throw new Error('No audio content received from Google TTS');
        }

        const audioBuffer = Uint8Array.from(atob(ttsData.audioContent), c => c.charCodeAt(0));
        const fileName = `${user.id}/${Date.now()}.mp3`;

        const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
        
        const { error: uploadError } = await supabaseAdmin.storage
          .from('audio-files')
          .upload(fileName, audioBuffer, {
            contentType: 'audio/mpeg',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('audio-files')
          .getPublicUrl(fileName);

        audioUrl = publicUrl;

        if (translation_id) {
          await supabaseAdmin
            .from('translations')
            .update({ audio_url: audioUrl, audio_generated: true })
            .eq('id', translation_id);
        }
      } catch (error) {
        console.error('Google TTS failed:', error);
        throw new Error(`Audio generation failed: ${error.message}`);
      }
    } else {
      throw new Error('Google API key not configured. Audio generation requires GOOGLE_API_KEY.');
    }

    return new Response(
      JSON.stringify({
        success: true,
        audio_url: audioUrl,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Generate audio error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate audio',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});