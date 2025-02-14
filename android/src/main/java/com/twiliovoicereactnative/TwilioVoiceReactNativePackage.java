package com.twiliovoicereactnative;

import androidx.annotation.NonNull;

import android.app.Activity;
import android.app.Application;
import android.content.Context;

import expo.modules.core.interfaces.ApplicationLifecycleListener;
import expo.modules.core.interfaces.Package;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class TwilioVoiceReactNativePackage implements ReactPackage, Package {
    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new TwilioVoiceReactNativeModule(reactContext));
        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<? extends ReactActivityLifecycleListener> createReactActivityLifecycleListeners(Context activityContext) {
        return Collections.singletonList(new TwilioVoiceReactActivityLifecycleListener((Activity) activityContext));
    }

    @Override
    public List<? extends ApplicationLifecycleListener> createApplicationLifecycleListeners(Context context) {
        return Collections.singletonList(new TwilioVoiceApplicationLifecycleListener((Application) context));
    }
}
