angular.module('app', ['onsen']).controller('BracketDashController', function () {
    var self = this;
    self.CurrentPage = "Home";
    self.activityexpand =false;
    self.accountexpand = false;
    self.settingsexpand = false;
    self.collapseall = function () {
        self.activityexpand = false; self.accountexpand = false; self.settingsexpand = false;
    }
    
    self.token = function () {
        return localStorage.getItem("token");
    };

    self.isloggedin = function () {
        if (self.token == null || self.token.length == 0 ||1==1)
            return false;
        else
            return true;
    };


    self.setMainPage = function (page, args, Title) {
        self.CurrentPage = Title;
        menu.setMainPage(page, args);
    }
    self.expandactivity = function () {
        var status = self.activityexpand;
        self.collapseall();
        if (status)
            self.activityexpand = false;
        else
            self.activityexpand = true;
    }
    self.expandaccount = function () {
        var status = self.accountexpand;
        self.collapseall();
        if (status)
            self.accountexpand = false;
        else
            self.accountexpand = true;
    }
    self.expandsettings = function () {
        var status = self.settingsexpand;
        self.collapseall();
        if (status)
            self.settingsexpand = false;
        else
            self.settingsexpand = true;
    }
    self.loginemail = '';
    self.loginpassword = '';
    self.login = function () {
        return true;
    }

    self.feedexpand = -1;
    self.expandfeed = function (id) {
        if (self.feedexpand == id)
        {
            self.feedexpand = -1;
            modcomments.hide();
        }
        else {
            self.feedexpand = id;
            self.showcomments(1, 1);
            //var modal = angular.element(document.querySelector('#feedmodal' + id));
            modcomments.show();
        }
    }
    self.showcomments = function (id, mode) {
        var comments = angular.element(document.querySelector('#comments' + id));
        var reports = angular.element(document.querySelector('#reports' + id));
        if (mode == 1)
        {
            comments.removeClass("ng-hide");
            reports.addClass("ng-hide");
        } else {
            reports.removeClass("ng-hide");
            comments.addClass("ng-hide");
        }
        
    }
});;