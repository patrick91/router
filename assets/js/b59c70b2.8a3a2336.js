"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[8840],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>m});var a=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=a.createContext({}),s=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},d=function(e){var t=s(e.components);return a.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,p=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),c=s(n),m=i,k=c["".concat(p,".").concat(m)]||c[m]||u[m]||o;return n?a.createElement(k,r(r({ref:t},d),{},{components:n})):a.createElement(k,r({ref:t},d))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,r=new Array(o);r[0]=c;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:i,r[1]=l;for(var s=2;s<o;s++)r[s]=n[s];return a.createElement.apply(null,r)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},7505:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>r,default:()=>u,frontMatter:()=>o,metadata:()=>l,toc:()=>s});var a=n(7462),i=(n(7294),n(3905));const o={title:"Universal Links"},r=void 0,l={unversionedId:"guides/universal-links",id:"guides/universal-links",title:"Universal Links",description:"Expo Router automatically creates deep links for every page. You can promote your deep links to universal links by adding verification files to your website and native app.",source:"@site/docs/guides/universal-links.md",sourceDirName:"guides",slug:"/guides/universal-links",permalink:"/router/docs/guides/universal-links",draft:!1,editUrl:"https://github.com/expo/router/tree/main/docs/docs/guides/universal-links.md",tags:[],version:"current",frontMatter:{title:"Universal Links"},sidebar:"tutorialSidebar",previous:{title:"Tabs",permalink:"/router/docs/guides/tabs"},next:{title:"React Navigation",permalink:"/router/docs/category/react-navigation"}},p={},s=[{value:"Deep Linking",id:"deep-linking",level:2},{value:"iOS",id:"ios",level:2},{value:"Android",id:"android",level:2},{value:"Debugging",id:"debugging",level:2},{value:"Trouble Shooting",id:"trouble-shooting",level:2}],d={toc:s};function u(e){let{components:t,...n}=e;return(0,i.kt)("wrapper",(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Expo Router automatically creates deep links for every page. You can promote your deep links to universal links by adding verification files to your website and native app."),(0,i.kt)("p",null,"Universal links require a 2-part verification process for both iOS and Android:"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("strong",{parentName:"li"},"Native app verification:")," This requires some form of code signing that references the target website domain (URL)."),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("strong",{parentName:"li"},"Website verification:")," This requires a file to be hosted on the target website in the ",(0,i.kt)("inlineCode",{parentName:"li"},"/.well-known")," directory.")),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"Universal links cannot be tested in the Expo Go app. You need to create a development build.")),(0,i.kt)("h2",{id:"deep-linking"},"Deep Linking"),(0,i.kt)("p",null,"The only step is to add a URI scheme to your app. Add a ",(0,i.kt)("inlineCode",{parentName:"p"},"scheme")," to your Expo config (",(0,i.kt)("inlineCode",{parentName:"p"},"app.json"),"/",(0,i.kt)("inlineCode",{parentName:"p"},"app.config.js"),"), this makes the app available via deep link:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json",metastring:"title=app.json",title:"app.json"},'{\n  "expo": {\n    "scheme": "myapp"\n  }\n}\n')),(0,i.kt)("p",null,"Alternatively, you can use ",(0,i.kt)("inlineCode",{parentName:"p"},"npx uri-scheme")," to generate a URI scheme for your native app."),(0,i.kt)("h2",{id:"ios"},"iOS"),(0,i.kt)("p",null,"Add your website URL to the iOS ",(0,i.kt)("a",{parentName:"p",href:"https://docs.expo.dev/versions/latest/config/app/#associateddomains"},"associated domains entitlement")," in your Expo config:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json",metastring:"title=app.json",title:"app.json"},'{\n  "expo": {\n    "ios": {\n      "associatedDomains": ["applinks:myapp.com"]\n    }\n  }\n}\n')),(0,i.kt)("p",null,"Build your native app with EAS Build to ensure the entitlement is registered with Apple. You can also use the ",(0,i.kt)("a",{parentName:"p",href:"https://developer.apple.com/account/resources/identifiers/list"},"Apple Developer Portal")," to add the entitlement manually."),(0,i.kt)("p",null,"Next, create a ",(0,i.kt)("inlineCode",{parentName:"p"},"public/.well-known/apple-app-site-association")," file and add the following:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json",metastring:"title=public/.well-known/apple-app-site-association",title:"public/.well-known/apple-app-site-association"},'{\n  "applinks": {\n    "apps": [],\n    "details": [\n      {\n        // Example: "QQ57RJ5UTD.com.bacon.app"\n        "appID": "{APPLE_TEAM_ID}.{BUNDLE_ID}",\n        // All paths that should support redirecting\n        "paths": ["*"]\n      }\n    ]\n  },\n  "activitycontinuation": {\n    "apps": [\n      // Enable Handoff\n      "{APPLE_TEAM_ID}.{BUNDLE_ID}"\n    ]\n  },\n  "webcredentials": {\n    "apps": [\n      // Enable shared credentials\n      "{APPLE_TEAM_ID}.{BUNDLE_ID}"\n    ]\n  },\n\n}\n')),(0,i.kt)("p",null,"Deploy your website to a server that supports HTTPS. See the ",(0,i.kt)("a",{parentName:"p",href:"/router/docs/guides/hosting"},"hosting guide for more"),"."),(0,i.kt)("p",null,"Finally, install the app on your device and open the website in Safari. You should be prompted to open the app. Expo Router will automatically redirect all web pages to the corresponding native pages."),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"Apple docs: ",(0,i.kt)("a",{parentName:"p",href:"https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/UniversalLinks.html"},"Universal Links"))),(0,i.kt)("h2",{id:"android"},"Android"),(0,i.kt)("p",null,"Add your website URL to the Android ",(0,i.kt)("a",{parentName:"p",href:"https://docs.expo.dev/versions/latest/config/app/#intentfilters"},"intent filters")," in your Expo config:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json",metastring:"title=app.json",title:"app.json"},'{\n  "expo": {\n    "android": {\n      "intentFilters": [\n        {\n          "action": "VIEW",\n          "data": {\n            "scheme": "https",\n            "host": "myapp.com"\n          },\n          "category": ["BROWSABLE", "DEFAULT"]\n        }\n      ]\n    }\n  }\n}\n')),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"Alternatively you can setup intent filters ",(0,i.kt)("a",{parentName:"p",href:"https://developer.android.com/training/app-links/verify-android-applinks#add-intent-filters"},"manually in the AndroidManifest.xml file"),".")),(0,i.kt)("p",null,"Create a JSON file for the website verification (aka ",(0,i.kt)("a",{parentName:"p",href:"https://developers.google.com/digital-asset-links/v1/getting-started"},"digital asset links")," file) at ",(0,i.kt)("inlineCode",{parentName:"p"},"public/.well-known/assetlinks.json")," and collect the following information:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"package_name"),": The Android ",(0,i.kt)("a",{parentName:"li",href:"https://docs.expo.dev/versions/latest/config/app/#package"},"application ID")," of your app (e.g. ",(0,i.kt)("inlineCode",{parentName:"li"},"com.bacon.app"),"). This can be found in the ",(0,i.kt)("inlineCode",{parentName:"li"},"app.json")," file under ",(0,i.kt)("inlineCode",{parentName:"li"},"expo.android.package"),"."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"sha256_cert_fingerprints"),": The SHA256 fingerprints of your app\u2019s signing certificate. This can be obtained in one of two ways:",(0,i.kt)("ol",{parentName:"li"},(0,i.kt)("li",{parentName:"ol"},"After building an Android app with EAS Build, run ",(0,i.kt)("inlineCode",{parentName:"li"},"eas credentials -p android")," and select the profile you wish to obtain the fingerprint for. The fingerprint will be listed under ",(0,i.kt)("inlineCode",{parentName:"li"},"SHA256 Fingerprint"),"."),(0,i.kt)("li",{parentName:"ol"},"by visiting the ",(0,i.kt)("a",{parentName:"li",href:"https://play.google.com/console/"},"Play Console")," developer account under ",(0,i.kt)("inlineCode",{parentName:"li"},"Release > Setup > App Integrity"),"; if you do, then you'll also find the correct Digital Asset Links JSON snippet for your app on the same page. The value will look like ",(0,i.kt)("inlineCode",{parentName:"li"},"14:6D:E9:83..."))))),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-json",metastring:"title=public/.well-known/assetlinks.json",title:"public/.well-known/assetlinks.json"},'[\n  {\n    "relation": ["delegate_permission/common.handle_all_urls"],\n    "target": {\n      "namespace": "android_app",\n      "package_name": "{package_name}",\n      "sha256_cert_fingerprints": [\n        // Supports multiple fingerprints for different apps and keys\n        "{sha256_cert_fingerprints}"\n      ]\n    }\n  }\n]\n')),(0,i.kt)("p",null,"Installing the app will trigger the ",(0,i.kt)("a",{parentName:"p",href:"https://developer.android.com/training/app-links/verify-android-applinks#web-assoc"},"Android app verification"),", which can take up to 20 seconds."),(0,i.kt)("p",null,"All in-app redirection is handled automatically by Expo Router. You can test your universal links by opening the website in Chrome and clicking on a link. You should be prompted to open the app."),(0,i.kt)("blockquote",null,(0,i.kt)("p",{parentName:"blockquote"},"Google docs: ",(0,i.kt)("a",{parentName:"p",href:"https://developer.android.com/training/app-links"},"App Links"))),(0,i.kt)("h2",{id:"debugging"},"Debugging"),(0,i.kt)("p",null,"Expo CLI enables you to test your universal links without deploying a website. Utilizing the ",(0,i.kt)("a",{parentName:"p",href:"https://docs.expo.dev/workflow/expo-cli/#tunneling"},(0,i.kt)("inlineCode",{parentName:"a"},"--tunnel")," functionality"),", you can forward your dev server to a publicly available https URL."),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"Set the environment variable ",(0,i.kt)("inlineCode",{parentName:"li"},"EXPO_TUNNEL_SUBDOMAIN=my-custom-domain"),' where "my-custom-domain" is a unique string that you will use during development. This will ensure that your tunnel URL is consistent across restarts.'),(0,i.kt)("li",{parentName:"ol"},"Setup universal links as described above, but this time using an Ngrok URL: ",(0,i.kt)("inlineCode",{parentName:"li"},"my-custom-domain.ngrok.io")),(0,i.kt)("li",{parentName:"ol"},"Start your dev server with the ",(0,i.kt)("inlineCode",{parentName:"li"},"--tunnel")," flag:")),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-bash"},"yarn expo start --tunnel\n")),(0,i.kt)("ol",{start:4},(0,i.kt)("li",{parentName:"ol"},"Build a development client: ",(0,i.kt)("inlineCode",{parentName:"li"},"yarn expo run:ios")," or ",(0,i.kt)("inlineCode",{parentName:"li"},"yarn expo run:android"),". This will install the development client on your device.")),(0,i.kt)("h2",{id:"trouble-shooting"},"Trouble Shooting"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Ensure your apple app site association file is valid by using a ",(0,i.kt)("a",{parentName:"li",href:"https://branch.io/resources/aasa-validator/"},"validator tool"),"."),(0,i.kt)("li",{parentName:"ul"},"Ensure your website is served over HTTPS."),(0,i.kt)("li",{parentName:"ul"},"The uncompressed ",(0,i.kt)("inlineCode",{parentName:"li"},"apple-app-site-association")," file cannot be ",(0,i.kt)("a",{parentName:"li",href:"https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/UniversalLinks.html"},"larger than 128kb"),"."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://developer.android.com/training/app-links/verify-android-applinks"},"Verify Android app links")),(0,i.kt)("li",{parentName:"ul"},"Ensure both website verification files are served with ",(0,i.kt)("inlineCode",{parentName:"li"},"content-type")," ",(0,i.kt)("inlineCode",{parentName:"li"},"application/json"),"."),(0,i.kt)("li",{parentName:"ul"},"Android verification may take up to 20 seconds to take effect.")))}u.isMDXComponent=!0}}]);