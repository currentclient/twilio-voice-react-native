package com.twiliovoicereactnative;

import android.app.Application;

import expo.modules.core.interfaces.ApplicationLifecycleListener;

public class TwilioVoiceApplicationLifecycleListener implements ApplicationLifecycleListener {

  private final VoiceApplicationProxy applicationProxy;

  protected TwilioVoiceApplicationLifecycleListener(Application application) {
    applicationProxy = new VoiceApplicationProxy(application);
  }

  @Override
  public void onCreate(Application application) {
    applicationProxy.onCreate();
  }
}
