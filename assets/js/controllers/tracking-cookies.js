/* ===== Zeste de Savoir ====================================================
   Manage tracking cookies message
========================================================================== */


app.controller("trackingCookiesCtrl", ["$scope", "$cookies", function($scope, $cookies) {
    $scope.showBanner = false;

    // Did the user already made a choice?
    $scope.hasConsent = ($cookies.hasconsent === "true" ? 
                         true : ($cookies.hasconsent === "false" ? 
                                 false : undefined));

    $scope.$watch("hasConsent", function(value) {
        if(value !== undefined) {
            // The user chose, so we hide the banner
            $scope.showBanner = false;

            // TODO : Use ngCookies when it will be possible
            document.cookie = "hasconsent="+value.toString()+"; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/";

            if(value === "true") {
                // The user consent to be track, so we do

                dataLayer = [{"gaTrackingId": "UA-27730868-1"}];
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":
                new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src=
                "//www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,"script","dataLayer","GTM-WH7642");
            }
        }
        else {
            // The user didn't choose, so we show the banner
            $scope.showBanner = true;
        }
    });
}]);