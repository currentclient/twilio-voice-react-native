package com.twiliovoicereactnative;

import android.annotation.SuppressLint;
import android.content.Context;
import android.media.*;
import android.net.Uri;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.provider.Settings;
import android.util.Log;

public class MediaPlayerManager {
  private static final String TAG = "MediaPlayerManager";

  private final Context context;
  private final AudioManager audioManager;
  private MediaPlayer player;
  private Ringtone ringtone;
  private Vibrator vibrator;
  private AudioFocusRequest focusRequest;

  public MediaPlayerManager(Context context) {
    this.context = context.getApplicationContext();
    this.audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      VibratorManager vibratorManager = (VibratorManager) this.context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
      this.vibrator = vibratorManager != null ? vibratorManager.getDefaultVibrator() : null;
    } else {
      this.vibrator = (Vibrator) this.context.getSystemService(Context.VIBRATOR_SERVICE);
    }
  }

  // =============================
  // Incoming call
  // =============================
  @SuppressLint("NewApi")
  public void startIncomingRingtone() {
    stop();

    // NOTE: Audio focus is managed by CallMediaSessionService (not here)
    // This method only handles ringer mode and audio routing

    // Respect device ringer mode (DND/Silent/Vibrate)
    switch (audioManager.getRingerMode()) {
      case AudioManager.RINGER_MODE_SILENT:
        Log.d(TAG, "Ringer mode SILENT - not playing ringtone");
        return;
      case AudioManager.RINGER_MODE_VIBRATE:
        Log.d(TAG, "Ringer mode VIBRATE - vibrating only");
        startVibration();
        return;
      case AudioManager.RINGER_MODE_NORMAL:
        Log.d(TAG, "Ringer mode NORMAL - playing ringtone");
        playIncoming();
        if (shouldVibrateWhenRinging()) {
          Log.d(TAG, "Vibrate when ringing enabled - also vibrating");
          startVibration();
        }
        return;
    }
  }

  @SuppressLint("NewApi")
  private void playIncoming() {
    // Use Ringtone class for incoming calls - automatically uses STREAM_RING
    // This ensures ring volume controls work and DND is respected
    try {
      Uri ringtoneUri = Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.incoming);
      ringtone = RingtoneManager.getRingtone(context, ringtoneUri);

      if (ringtone != null) {
        // Set audio attributes to use ringtone stream
        AudioAttributes attributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
        ringtone.setAudioAttributes(attributes);

        // Set audio mode for ringing
        audioManager.setMode(AudioManager.MODE_RINGTONE);
        audioManager.setSpeakerphoneOn(true);

        // Set looping via RingtoneManager
        ringtone.setLooping(true);
        ringtone.play();

        Log.d(TAG, "Ringtone started using Ringtone class with STREAM_RING");
      }
    } catch (Exception e) {
      Log.e(TAG, "Error playing incoming ringtone: ", e);
    }
  }

  // =============================
  // Outgoing ringback
  // =============================
  @SuppressLint("NewApi")
  public void startRingback() {
    stop();

    audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
    audioManager.setSpeakerphoneOn(false); // typically through earpiece

    player = MediaPlayer.create(context, R.raw.ringtone);
    if (player != null) {
      player.setLooping(true);
      player.setAudioAttributes(
              new AudioAttributes.Builder()
                      .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                      .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                      .build()
      );
      player.start();
    }
  }

  // =============================
  // Disconnect / end tone
  // =============================
  @SuppressLint("NewApi")
  public void playDisconnectTone() {
    stop();

    player = MediaPlayer.create(context, R.raw.disconnect);
    if (player != null) {
      player.setAudioAttributes(
              new AudioAttributes.Builder()
                      .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                      .build()
      );
      player.setOnCompletionListener(mp -> stop());
      player.start();
    }
  }

  // =============================
  // Stop all playback
  // =============================
  @SuppressLint("NewApi")
  public void stop() {
    try {
      if (player != null) {
        player.stop();
        player.release();
        player = null;
        Log.d(TAG, "MediaPlayer stopped");
      }
      if (ringtone != null) {
        ringtone.stop();
        ringtone = null;
        Log.d(TAG, "Ringtone stopped");
      }
      if (vibrator != null) {
        vibrator.cancel();
      }

      // Only reset audio state when the incoming ringtone was playing (MODE_RINGTONE).
      // startIncomingRingtone() sets MODE_RINGTONE + setSpeakerphoneOn(true); both
      // must be cleared when the ringtone stops. For outbound calls, AudioSwitch
      // already set MODE_IN_COMMUNICATION in onRinging() — resetting it here routed
      // audio to the speaker for the duration of the call (PRO-3848).
      if (audioManager.getMode() == AudioManager.MODE_RINGTONE) {
        audioManager.setMode(AudioManager.MODE_NORMAL);
        audioManager.setSpeakerphoneOn(false);
        Log.d(TAG, "Ringtone stopped: reset audio mode to MODE_NORMAL, speakerphone off");
      } else {
        Log.d(TAG, "stop(): audio mode is " + audioManager.getMode() + ", no ringtone reset needed");
      }

      // NOTE: Audio focus is managed by CallMediaSessionService (not here)
    } catch (Exception e) {
      Log.e(TAG, "Error stopping audio: ", e);
    }
  }

  /**
   * Check if the device is configured to vibrate when ringing.
   * On most Android devices, this is the "Vibrate when ringing" toggle in Sound settings.
   */
  private boolean shouldVibrateWhenRinging() {
    // 3-arg getInt never throws — returns the default (1) on failure
    int vibrateSetting = Settings.System.getInt(
            context.getContentResolver(),
            Settings.System.VIBRATE_WHEN_RINGING,
            1  // Default to vibrate if setting not found
    );
    return vibrateSetting == 1;
  }

  private void startVibration() {
    if (vibrator == null || !vibrator.hasVibrator()) {
      Log.w(TAG, "Device does not have a vibrator");
      return;
    }
    // Vibration pattern: vibrate 1s, pause 1s, repeat
    long[] pattern = {0, 1000, 1000};
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      // Use amplitude control on Android O+ for a strong vibration
      vibrator.vibrate(VibrationEffect.createWaveform(pattern, new int[]{0, 255, 0}, 0));
    } else {
      vibrator.vibrate(pattern, 0);
    }
  }

  public void release() {
    stop();
  }
}
