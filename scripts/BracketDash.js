
angular.module('app', ['onsen', 'ngAnimate'])
    .controller('BracketDashController', function ($scope, $rootScope) {
        $scope.feed = {};
        $scope.bio = {};
        $scope.NewActivity = { type: '', title: '', desc: '', cat: 'Entertainmnet', visibility: 'Public', branchlength: 4, branches: [], battleusers:[] };
        $scope.newactivityvalidation = {};
        $scope.branchlength = [4,8 ,16];
        $scope.usersearchresult = [];
        $scope.currentbranchuser = {branchindex: 0,userindex:0};
        $scope.searchuserquery = {q:''};
        $scope.searchuserminlen = '';
        $scope.myaudience = [];
        $scope.listusers = [];
        var self = this;
        self.isloading = false;
        self.activityexpand = false;
        self.accountexpand = false;
        self.settingsexpand = false;
        self.collapseall = function () {
            self.activityexpand = false; self.accountexpand = false; self.settingsexpand = false;
        }

        self.token = function () {
            return localStorage.getItem("access_token");
        };
        self.isloggedin = false;
        self.checklogin = function () {
            if (self.token() == null || self.token().length == 0)
            {
                self.isloggedin = false;
            }
            else {
                self.isloggedin = true;
                }
        };
        self.userinfo = null;
        self.viewuserinfo = null;

        self.setMainPage = function (page, args, Title) {

            self.CurrentPage = Title;
            menu.setMainPage(page, args);
            //ko.applyBindings(vm,page);
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

        self.issearching = false;
        self.clicksearch = function () {
            if (self.issearching) {
               
                    self.issearching = false;
               
            } else {
                self.overlaylement('searchinput', 'searchicon',0, 0,20, 0, null, null, 'slide-right');
                //self.overlaylement('icncancelsearch', 'txtsearch', 1, 0, 0, null, null, 'slide-right');
                
                self.issearching = true;
            }

        }
        self.loginemail = '';
        self.loginpassword = '';
        self.login = function () {
            if(self.loginemail.length == 0 || self.loginpassword.length ==0)
            {return;}
            var login_obj = {"action":"login", "email": self.loginemail, "password": self.loginpassword, "remember_me":"true" };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: login_obj,
                crossDomain: true,
                success: function (data) {
                    console.log(data);
                    var obj = JSON.parse(data);
                    console.log(obj);
                    //alert(data);
                    if (obj.request_status == 'success') {
                        var access_token = obj.response.access_token;
                        console.log(access_token);
                        var exp = obj.response.exp;
                        console.log(exp);
                        var username = obj.response.username;
                        console.log(username);
                        self.storetoken(access_token, username, exp, true);
                        self.getfeed('explore', 'Explore')
                        self.isloggedin = true;
                        //$('input').not('[type="button"]').val('');
                        //doChange('#profile');
                        //localStorage.setItem("access_token",);
                    } else if (obj.request_status == 'invalid_password') {
                        alert("Invalid password");
                    } else if (obj.request_status == 'invalid_email') {
                        alert("Invalid email address");
                    }

                },
                error: function (data) {
                    alert(jSON.stringify(data));
                }
            });
            return true;
        }
        self.logout = function () {
            localStorage.removeItem('access_token');
            self.getfeed('explore', 'Explore')

        }
        self.validateactivity = function ()
        {
            $scope.newactivityvalidation = { status: true, reason: 'valid' };

            if (!$scope.NewActivity.title || $scope.NewActivity.title.length == 0)
            {
                $scope.newactivityvalidation = { status: false, reason: 'Please enter activity title' };
            }
            if (!$scope.NewActivity.desc || $scope.NewActivity.desc.length == 0) {
                $scope.newactivityvalidation = { status: false, reason: 'Please enter activity decription' };
            }
            if (!$scope.NewActivity.cat || $scope.NewActivity.cat == '') {
                $scope.newactivityvalidation = { status: false, reason: 'Please select activity category' };
            }
            if ($scope.NewActivity.branches.length / 4 !=1) {
                $scope.newactivityvalidation = { status: false, reason: 'Branches can be 4, 8, 16' };
            }
            for (var i = 0; i < $scope.NewActivity.branches;i++)
            {
                for (var k = 0; k < $scope.NewActivity.branches[i].users; i++)
                {
                    if ($scope.NewActivity.branches[i].users[k].username == '')
                    {
                        $scope.newactivityvalidation = { status: false, reason: 'please fill all users of the branches' };
                    }
                }
            }
        }
        self.addactivity = function () {
            self.validateactivity();
            alert(JSON.stringify( $scope.newactivityvalidation));

        }

        $scope.registerusername = '';
        $scope.registeremail = '';
        $scope.registerpassword = '';
        $scope.registerpasswordconfirm = '';
        self.register = function () {
            if (self.loginemail.length == 0 || self.loginpassword.length == 0)
            { return; }
            var login_obj = { "action": "login", "email": self.loginemail, "password": self.loginpassword, "remember_me": "true" };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: login_obj,
                crossDomain: true,
                success: function (data) {
                    console.log(data);
                    var obj = JSON.parse(data);
                    console.log(obj);
                    if (obj.request_status == 'success') {
                        var access_token = obj.response.access_token;
                        console.log(access_token);
                        var exp = obj.response.exp;
                        console.log(exp);
                        var username = obj.response.username;
                        console.log(username);
                        self.storetoken(access_token, username, exp, login_obj.remember_me);
                        $('input').not('[type="button"]').val('');
                        //doChange('#profile');
                    } else if (obj.request_status == 'invalid_password') {
                        alert("Invalid password");
                    } else if (obj.request_status == 'invalid_email') {
                        alert("Invalid email address");
                    }

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
        }

        self.search = function () {
            return true;
        }
        self.showlogo = function () {
            if (self.issearching == true)
                return false;
            else
                return true;
        }

        //self.feed = [];
        self.feedexpand = -1;
        self.expandfeed = function (id) {
            if (self.feedexpand == id) {
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
            if (mode == 1) {
                comments.removeClass("ng-hide");
                reports.addClass("ng-hide");
            } else {
                reports.removeClass("ng-hide");
                comments.addClass("ng-hide");
            }

        }

        self.showbio = function () {

        }
        self.getprofile = function ajax_profile(profile_username) {
            if (profile_username == null && self.isloggedin) {
                profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            }
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                data: { action: 'profile_info', profile_username: profile_username },
                crossDomain: true,
                success: function (data) {
                    var json_obj = JSON.parse(data);
                    console.log(data);
                    //alert(JSON.stringify(json_obj));
                    //var obj = json_obj.obj;
                    // console.log(obj);
                    if (profile_username == null) {
                        self.viewuserinfo = json_obj;
                        angular.extend(self.viewuserinfo, json_obj);
                    }
                    else{
                    self.userinfo = json_obj;
                    angular.extend(self.userinfo, json_obj);
                    }
                    self.getbio(null);

                }
            });
        }
        $scope.searchuser = function (q) {
            if (q < $scope.searchuserminlen)
                return;
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            $.ajax({
                type: 'POST',
                url: "http://www.bracketdash.com/api/api.php",
                data: { action: 'search_user', searchquery: q, limit: 5 },
                crossDomain: true,
                success: function (data) {
                    var json_obj = JSON.parse(data);
                    console.log(data);
                    $scope.usersearchresult = json_obj.search_result;
                    angular.extend($scope.usersearchresult, json_obj.search_result);
                    $scope.$apply();
                   
                }
            });

        
        }

        $scope.showuserlist = function ($event,userlist) {
            $scop.userlist = userlist;
            $scope.popoveruserlist.show($event);

        }
        
        self.selectuser = function ($event, username, avatar, fullname) {
            if ($scope.NewActivity.type == 'bracket')
            {
                $scope.NewActivity.branches[$scope.currentbranchuser.branchindex].users[$scope.currentbranchuser.userindex].Username = username;
                $scope.NewActivity.branches[$scope.currentbranchuser.branchindex].users[$scope.currentbranchuser.userindex].Avatar_link = avatar;
                $scope.NewActivity.branches[$scope.currentbranchuser.branchindex].users[$scope.currentbranchuser.userindex].Fullname = fullname;
                $scope.popoveruserselect.hide($event);
            }
            if ($scope.NewActivity.type == 'battle')
            {
                var newuser = { Username: username, Avatar_link: avatar, Fullname: fullname };
                $scope.NewActivity.battleusers.push(newuser);
            }

        }
        self.popselectuser = function ($event, branchindex, userindex) {
            self.overlaylement('btnclosesearchuser', 'popselect', -20, -20, 0, 0, null, null, 'slide-right');
            $scope.currentbranchuser.branchindex = branchindex;
            $scope.currentbranchuser.userindex = userindex;
            $scope.popoveruserselect.show($event);
        }


        self.getbio = function ajax_bio(profile_username) {
           
            if (profile_username == null) {
                console.log("self.userinfo" + JSON.stringify(self.userinfo))
                profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
                self.viewuserinfo = self.userinfo;
                console.log("viewuserinfo" + JSON.stringify(self.viewuserinfo))

            }
            else
            {
                //self.getprofile(profile_username);
            }
            

            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                data: { action: 'bio', profile_username: profile_username },
                crossDomain: true,
                success: function (data) {

                    var json_obj = JSON.parse(data);
                    console.log(JSON.stringify(json_obj))
                    $scope.bio = json_obj;
                    
                    angular.extend($scope.bio, json_obj);
                    console.log("bio"+JSON.stringify($scope.bio))
                    //self.setMainPage('BioContent.html', { closeMenu: true }, "Bio");
                    self.isloading = false;
                }
            });
        }
        self.getfeed = function (action,title) {
            try {
                
            self.isloading = true;
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                data: { action: action, limit: 10 },
                crossDomain: true,
                success: function (data) {
                    console.log(data);
                    var json_obj = JSON.parse(data);
                    console.log(json_obj);
                    var obj = json_obj.obj;
                    console.log(obj);
                    $scope.feed = json_obj.obj;
                    angular.extend($scope.feed, json_obj.obj);
                    self.setMainPage('page1.html', { closeMenu: true }, title);
                    self.isloading = false;
                },
                error: function (data) {
                    alert(JSON.stringify(data));
                    self.isloading = false;
                }
            });
            } catch (e) { alert(e);}
        }

        self.getpanel = function (action, title) {
            self.isloading = true;
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            var data = { action: action, profile_username: profile_username, limit: 10 };
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
                },
                data: { action: action, profile_username: profile_username, limit: 10 },
                crossDomain: true,
                success: function (data) {
                    console.log(data);
                    var json_obj = JSON.parse(data);
                    console.log(json_obj);
                    var obj = json_obj.obj;
                    console.log(obj);
                    $scope.feed = json_obj.obj;
                    angular.extend($scope.feed, json_obj.obj);
                    self.setMainPage('page1.html', { closeMenu: true }, title);
                    self.isloading = false;
                },
                error: function (data) {
                    self.isloading = false;
                }
            });
        }

        $scope.getaudience = function ajax_audience() {
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
             $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                crossDomain: true,
                data: { action: 'audience', profile_username: profile_username, limit: 10 },
                success: function (data) {
                    var json_obj = JSON.parse(data);
                    console.log(json_obj);
                    var obj = json_obj.obj;
                    console.log(obj);
                    $scope.myaudience = json_obj.obj;
                    angular.extend($scope.myaudience, json_obj.obj);
                    alert(JSON.stringify($scope.myaudience));
                    self.setMainPage('Audience.html', { closeMenu: true }, 'Audience');
                }
            });
        }
        self.explore = function(){
            
        }

   
        $scope.$watch('NewActivity.branchlength', function (value) {
            for (var i = 0; i < $scope.NewActivity.branchlength /2 ; i++) {
                var b = { branchindex: i, users: [{ Username: '', Fullname: '', Avatar_link: '' }, { Username: '', Fullname: '', Avatar_link: '' }] };
                $scope.NewActivity.branches.push(b);
            }
        });

        $scope.$watch('searchuserquery.q', function (value) {
            if ($scope.searchuserquery.q.length > 3)
            {
                $scope.searchuser($scope.searchuserquery.q);
            }
        });


        ons.ready(function () {
            self.checklogin();
            self.getprofile(null);
            //self.setMainPage('NewActivity.html', {}, 'New Activity');
            self.getfeed('explore','Explore');
            ons.createPopover('popover.html').then(function(popover) {
                $scope.popover = popover;
            });
            ons.createPopover('popovervisibility.html').then(function (popovervisibility) {
                $scope.popovervisibility = popovervisibility;
            });
            ons.createPopover('popoveruserselect.html').then(function (popoveruserselect) {
                $scope.popoveruserselect = popoveruserselect;
            });

            ons.createPopover('popoverbranchlength.html').then(function (popoverbranchlength) {
                $scope.popoverbranchlength = popoverbranchlength;
            });
            ons.createPopover('popoveruserlist.html').then(function (popoveruserlist) {
                $scope.popoveruserlist = popoveruserlist;
            });
        });
        $scope.cats = ['Entertainment', 'Sports','Humor', 'Music','Poetry','Arts','Other'];
        $scope.visibilityoptions = ['Public', 'Audience'];
        $scope.contestants = [];

        
        self.overlaylement = function (elem,target,top,right,left,bottom,elemwidth,elemheight,anim) {
            var element = $('#' + elem);
            if (elemwidth != null && elemwidth >0)
                element.width(elemwidth);
            if (elemheight != null && elemheight >0)
                element.height(elemheight);
            var target = $('#' + target);

            var offset = target.offset();
            var height = target.css('height');
            var width = target.css('width');
            var elemtop =  (target.height() / 2)  + 'px';
            element.css({
                position: 'absolute',
                'z-index':10001,
                top:elemtop
            }); 
            if (right != null)
            {
                var elemright = target.width()+ right + 10;
                element.css({
                    right: elemright + 'px'
                });
            }
            
            if (left !=null)
            {
                var elemleft = target.width() + left + 10 ;
                element.css({
                    right: elemright +'px'
                });
            }
           
        }

        self.storetoken = function (access_token, username, exp, remember_me) {
               if (remember_me == false) {
                    sessionStorage.setItem('access_token', access_token);
                    //sessionStorage.setItem('session_username', username);
                    sessionStorage.setItem('profile_username', username);
                    sessionStorage.setItem('exp', exp);
                } else {
                    localStorage.setItem('access_token', access_token);
                    //localStorage.setItem('session_username', username);
                    localStorage.setItem('profile_username', username);
                    localStorage.setItem('exp', exp);
                }

            }
        
        
    });

