function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

// Common
define("LIMIT_ITEMS", 4);
define("LOAD_NEXT_ITEMS", 2);
define("LIMIT_QUERY", 10);
define("LIMIT_CHAT_MESSAGES", 10);
define("PAGINATION", 10);
define("TOKEN_VALIDITY", 7); // in days
define("DEFAULT_DISTANCE", 99);

// Discover roommates
define("LIMIT_CANDIDATES", 40); // Find only roommates active in the last x days
define("LIMIT_TARGETED_USERS", 60);

// Item
define("ITEM_DURATION", 90); // An ad is active for 90 days
define("APPROX_BEGIN_AVAILABILITY", 1); // If there is a begin date, we gonna look for ads beginning around 1 weeks before
define("APPROX_END_AVAILABILITY", 2); // When user set an end date, we gonna look for ads ending around 2 weeks before and after

// Yelp
define("YELP_SEARCH_URL", "https://api.yelp.com/v3/businesses/");
define("YELP_CLIENT_API_KEY", "");
define("YELP_SEARCH_LIMIT", 10); // How much items should be found
define("YELP_SEARCH_RADIUS", 1000); // How much meters next to the place should be queried
define("YELP_SEARCH_SORT", "best_match"); // SORT: BEST_MATCHED: 'best_match', RATING: 'rating', REVIEW_COUNT : 'review_count', DISTANCE: 'distance'

// Spotify
define("SPOTIFY_TOKEN_URL", "https://accounts.spotify.com/api/token");
define("SPOTIFY_CLIENT_ID", "");
define("SPOTIFY_CLIENT_SECRET", "");

// Facebook
define("FACEBOOK_URL", "https://graph.facebook.com/v3.0/");
define("FACEBOOK_APP_ID", "");
define("FACEBOOK_APP_SECRET", "");

// Google
define("GOOGLE_API_KEY", "");
define("GOOGLE_API_PLACE_NEARBY_URL", "https://maps.googleapis.com/maps/api/place/nearbysearch/json");
define("GOOGLE_API_PLACE_AUTOCOMPLETE_URL", "https://maps.googleapis.com/maps/api/place/autocomplete/json");
define("GOOGLE_API_PLACE_DETAILS_URL", "https://maps.googleapis.com/maps/api/place/details/json");
define("GOOGLE_LOGIN_CLIENT_ID_IOS", "");
define("GOOGLE_LOGIN_CLIENT_ID_WEB", "");
define("GOOGLE_LOGIN_TOKEN_URL", "https://www.googleapis.com/oauth2/v4/token");
define("GOOGLE_LOGIN_CLIENT_SECRET", "");

// Push notifications and Amazon SNS
define("ARN_ANDROID_URL", "");
define("ARN_IOS_PROD", false);
define("ARN_IOS_DEV_SANDBOX_URL", "");
define("ARN_IOS_PROD_SANDBOX_URL", "");

// Push notifications new items, max how many users to resolve pro item
define("MAX_ITEM_USERS", 1000);

// Access to Peter Parker
define("AUTH_SECRET", "");

// Rules for products...to be understand as:
// Boolean: true = free, false = need subscription
// Number: limit value/count to
// For example: Limit review disliked? True or false
define("FREEMIUM_RULES", {
    browse: {
        reviewDisliked: true,
        changeDistance: true,
        changeBudget: true,
        viewApplicants: false,
        maxInterests: 1,
        maxDailyLikes: 20
    },
    ad: {
        maxDailySuperstars: 10
    }
});