// Copyright 2023-present 650 Industries. All rights reserved.

import ExpoModulesCore
import CoreSpotlight

/// Represents the Info.plist.
public struct InfoPlist
{
    public init(){}
    
    /// Returns the custom URL schemes registered by the app ('CFBundleURLSchemes' array).
    public static func bundleURLSchemes() -> [String]
    {
        guard let path = Bundle.main.path(forResource: "Info", ofType: "plist") else {
            log.error("Can’t find path to Info.plist in the main bundle.")
            return []
        }
        guard
            let infoDict = NSDictionary(contentsOfFile: path) as? [String: AnyObject],
            let anyDictionary = (infoDict["CFBundleURLTypes"] as? [[String: Any]])?.first,
            let urlSchemes = anyDictionary["CFBundleURLSchemes"] as? [String]
        else {
            log.error("Can’t find path to CFBundleURLSchemes in the Info.plist.")
            return []
        }
        return urlSchemes
    }
}

func encoded(_ value: String) -> String {
    return value.addingPercentEncoding(withAllowedCharacters: .urlHostAllowed) ?? value
}

func sendFakeDeepLinkEventToReactNative(obj: Any, url: String) {
    NotificationCenter.default.post(
        name: NSNotification.Name(rawValue: "RCTOpenURLNotification"),
        object: obj,
        userInfo: ["url": url]);
}

func userInfoToQueryString(_ userInfo: [String : NSSecureCoding]?) -> String {
    guard let userInfo = userInfo else {
        return ""
    }
    var queryString = ""
    for (key, value) in userInfo {
        if let value = value as? String {
            if key != "href" {
                queryString += "&\(encoded(key))=\(encoded(value))"
            }
        }
    }
    return queryString
}

public class ExpoHeadAppDelegateSubscriber: ExpoAppDelegateSubscriber {
    public func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        launchedActivity = userActivity
        
        if let wellKnownHref = userActivity.userInfo?["href"] as? String {
            // From other native device to app
            sendFakeDeepLinkEventToReactNative(obj: self, url: wellKnownHref)
        } else if var url = userActivity.webpageURL {
            // From website to app
            
            let schemes = InfoPlist.bundleURLSchemes()
            
            var deepLink = "\(schemes[0])://\(url.relativePath)"
                        
            let components = URLComponents(string: url.absoluteString)
            if let qs = components?.query {
                deepLink += "?\(qs)"
                deepLink += "&ref=web-handoff"
            } else {
                deepLink += "?ref=web-handoff"
            }
            
            sendFakeDeepLinkEventToReactNative(obj: self, url: deepLink)
        } else if (userActivity.activityType == CSQueryContinuationActionType) {
            // From Spotlight search
            if let query = userActivity.userInfo?[CSSearchQueryString] as? String {
                let schemes = InfoPlist.bundleURLSchemes()
                let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlHostAllowed) ?? query
                // TODO: Allow user to define the scheme using structured data or something.
                // opensearch = Chrome. spotlight = custom thing we're using to identify iOS
                let url = "\(schemes[0])://search?q=\(encodedQuery)&ref=spotlight"
                
                // https://github.com/search?q=
                sendFakeDeepLinkEventToReactNative(obj: self, url: url)
            }
        }
        
        return false
    }
}
