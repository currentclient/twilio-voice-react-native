require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "twilio-voice-react-native"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/mhuynh5757/twilio-voice-react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm}"

  # Ringback tone for outgoing calls. Must stay in sync with the lookup in
  # TwilioVoiceReactNative+CallKit.m -playRingback, which resolves this bundle
  # via +[NSBundle bundleForClass:].
  s.resource_bundles = { "TwilioVoiceReactNativeAssets" => ["ios/Resources/**/*"] }

  s.dependency "React-Core"
  s.dependency "TwilioVoice", "6.13.7"
  s.xcconfig  =  { 'VALID_ARCHS' => 'arm64 x86_64' }
  s.pod_target_xcconfig   = { 'VALID_ARCHS[sdk=iphoneos*]' => 'arm64', 'VALID_ARCHS[sdk=iphonesimulator*]' => 'arm64 x86_64' }
end
