angular.module('app', ['onsen', 'ngAnimate', 'ngSanitize'])
.controller('BracketDashController', function ($scope, $rootScope, $filter, $sce, $filechooser, Transloadit) {
        $scope.version44 = false;
        $scope.feed = [];
        $scope.feedlimit = 0;
        $scope.notificationlimit = 10;
        $scope.commentslimit = 10;
        $scope.conversationlimit = 10;
        $scope.audiencelimit = 10;
        $scope.bio = {};
        $scope.NewActivity = {
            type: '', title: '', description: '', round: 1, category: 'entertainment', visibility: 'public',duration:'3600',validvideo:true,
            branchlength: 4, branches: [], contestants: [], video_links: { "webm": null, "ogg": null, "mp4": null, "phone": null, "tablet": null ,thumbnail:null}
        };
        $scope.validvideo = true;
        $scope.durationtype = 'hour(s)';
        $scope.durationnumber = '1';
        $scope.selectdurationtype = ['hour(s)', 'day(s)', 'week(s)'];
        $scope.setdurationtype = function (step) {

            var ind = $scope.selectdurationtype.indexOf($scope.durationtype);
            if (ind == 0 && step ==-1)
                ind = $scope.selectdurationtype.length ;
            if (ind == $scope.selectdurationtype.length-1 && step == +1)
                ind = -1;
            $scope.durationtype = $scope.selectdurationtype[ind + step];
            
        }
        $scope.setduration = function (value) {

            //(value);
            $scope.durationnumber = value;
            $scope.dialogduration.hide();
        }
        $scope.NewResponse = {
            activity_id: null, video_links_array: { "webm": null, "ogg": null, "mp4": null, "phone": null, "tablet": null }
        };
        $scope.NewProgress = {
            activity_id: null, video_links_array: { "webm": null, "ogg": null, "mp4": null, "phone": null, "tablet": null }
        };
        $scope.newactivityvalidation = {};
        $scope.branchlength = [4, 8, 16];
        $scope.usersearchresult = [];
        $scope.currentbranchuser = { branch_no: 0, userindex: 0 };
        $scope.searchuserquery = { q: '' };
        $scope.searchuserminlen = '';
        $scope.myaudience = [];
        $scope.listusers = [];
        $scope.searchquery = { q: '' };
        $scope.searchqueryminlen = 1;
        $scope.searchresult = { people: [], activity: [] };
        $scope.showsingleactivity = {};
        $scope.viewuserinfo = { audience: [] };

        $scope.currentfeed = {};

        $scope.notifications = [];
        $scope.messages = [];

        $scope.newmessage = [];
        $scope.compose = {from:'',to:[],usernames:[],message:''};
        $scope.CurrentConversation = {};

        $scope.history = [];

        $scope.isuploading = 0;
        $scope.result = { id: 0, msg: '', css:'' };

        $scope.isloading = false;
        $scope.isplaying = '';

        $scope.newcomment = {text:''};
        $scope.newreport = { text: '' };
        $scope.history = [];

        var self = this;

        self.activityexpand = false;
        self.accountexpand = false;
        self.settingsexpand = false;
        self.messagesexpand = false;
        self.collapseall = function () {
            self.activityexpand = false; self.accountexpand = false; self.settingsexpand = false; self.messagesexpand = false;
        }

        self.token = function () {
            return localStorage.getItem("access_token");
        };
        self.isloggedin = false;
        self.checklogin = function () {
            
            if (self.token() == null || self.token().length == 0) {
                self.isloggedin = false;
            }
            else {
                self.isloggedin = true;
            }
            //alert(self.isloggedin);
            $scope.$apply();
            return self.isloggedin;
        };
        self.userinfo = null;

        self.setMainPage = function (page, args, Title,skiphistory) {
            if (!skiphistory)
                $scope.history.push({ page: page, args: args, title: Title });
            self.CurrentPage = Title;
            $scope.CurrentPageAddress = page;
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
        self.expandmessages = function () {
            var status = self.messagesexpand;
            self.collapseall();
            if (status)
                self.messagesexpand = false;
            else
                self.messagesexpand = true;
        }

        self.issearching = false;
        self.clicksearch = function () {
            if (self.issearching) {
                self.issearching = false;
                $scope.searchquery.q = '';
                self.goback(2);

            } else {
                self.overlaylement('searchinput', 'searchicon', null, 35, null, null, null, null, 'slide-right');
                //self.overlaylement('icncancelsearch', 'txtsearch', 1, 0, 0, null, null, 'slide-right');
                self.setMainPage('Search.html', {}, 'Search');
                self.issearching = true;
            }

        }
        $scope.showemailconfirmation = true;
        $scope.hideemailconfirmation = function () { $scope.showemailconfirmation = false; $scope.$apply(); }
        
        self.goback = function (step) {
            
            var history = $scope.history[$scope.history.length - step];
            self.setMainPage(history.page, history.args, history.title,true);
        }

        self.loginemail = '';
        self.loginpassword = '';

        $scope.loginobj = { loginemail: null, loginpassword: null};
        $scope.loginvalidation = { emailstatus: 0, passwordstatus: 0 };
        $scope.validateloginemail = function () {
            if (!$scope.loginobj.loginemail || $scope.loginobj.loginemail.toString().length == 0) {
                $scope.loginvalidation.emailstatus = -1;
                $scope.loginvalidation.reason = 'Please enter email';
            }
            else {
                $scope.loginvalidation.emailstatus = 1;
            }
        }
        $scope.validateloginpassword = function () {
            if (!$scope.loginobj.loginpassword || $scope.loginobj.loginpassword.toString().length == 0) {
                $scope.loginvalidation.passwordstatus = -1;
                $scope.loginvalidation.reason = 'Please enter password';
            }
            else {
                $scope.loginvalidation.passwordstatus = 1;
            }
        }
       
        $scope.resetvalidation = { passwordstatus: 0 };
        $scope.resetpassword = function () {
            $scope.isloading = true;
            if ($scope.forgotemail.toString().length == 0)
            { return; }
            $.ajax({
                url: "https://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: { action: "reset_password", username: self.userinfo.Username, reset_code: reset_code, password: password },
                crossDomain: true,
                success: function (data) {
                   
                    data = JSON.parse(data);
                    if (data.status == 'success') {
                        $scope.isloading = false;
                        $scope.result = { id: 1, msg: 'Your password has changed', css: 'successtoolbar' };
                        $scope.$apply();

                    } else {
                        $scope.isloading = false;
                        $scope.result = { id: -1, msg: 'Your password could not be changed', css: 'errortoolbar' };
                        $scope.$apply();

                    }
                },
                error: function (data) {
                    $scope.isloading = false;
                    $scope.result = { id: -1, msg: 'Your password could not be changed', css: 'errortoolbar' };
                    $scope.$apply();
                }

            });
            return true;

            
        }
        $scope.login = function () {
            $scope.isloading = true; $scope.confirmresult();
            if ($scope.loginobj.loginemail.toString().length == 0 || $scope.loginobj.loginpassword.toString().length == 0)
            { return; }
            var login_obj = { "action": "login", "email": $scope.loginobj.loginemail, "password": $scope.loginobj.loginpassword, "remember_me": "true" };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: login_obj,
                crossDomain: true,
                success: function (data) {
                    $scope.isloading = false;
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);
                    //alert(data);
                    if (obj.request_status == 'success') {
                        var access_token = obj.response.access_token;
                      //  console.log(access_token);
                        var exp = obj.response.exp;
                       // console.log(exp);
                        var username = obj.response.username;
                        //console.log(username);
                        self.storetoken(access_token, username, exp, true);
                        self.getfeed('explore', 'Explore')
                        self.isloggedin = true;

                       
                        //$('input').not('[type="button"]').val('');
                        //doChange('#profile');
                        //localStorage.setItem("access_token",);
                        self.getmyprofile(false);
                        if ($scope.logincallback)
                        {
                            if ($scope.logincallback.fun == "likevideostopeed")
                            {
                                self.likevideo($scope.logincallback.p1, $scope.logincallback.p2);
                            }
                        }
                    } else if (obj.request_status == 'invalid_password') {
                        $scope.isloading = false;
                        $scope.result.id = -1;
                        $scope.result.msg = 'Invalid Password';

                        $scope.result.css = 'errortoolbar';
                        $scope.$apply();
                        //alert("Invalid password");
                    } else if (obj.request_status == 'invalid_email') {
                        $scope.isloading = false;
                        $scope.result.id = -1;
                        $scope.result.msg = 'Invalid Email Address';
                        $scope.result.css = 'errortoolbar';
                        $scope.$apply();
                    }
                    $scope.dialoglogintocontinue.hide();
                },
                error: function (data) {
                    $scope.isloading = false;
                    $scope.$apply();
                    // alert(jSON.stringify(data));
                }
            });
            return true;
        }
        self.help = function () {

            self.setMainPage('Help.html', { closeMenu: true }, 'Help');

        }

        self.logout = function () {
            localStorage.removeItem('profile_username');
            localStorage.removeItem('access_token');
            $scope.newuser = {};
            self.getfeed('explore', 'Explore')
            self.isloggedin = false;
            self.userinfo = {};
            
        }
        $scope.forgotemail = { email: '' };
        $scope.forgotpassword = function () {
            $scope.isloading = true;
            if ($scope.forgotemail.toString().length == 0)
            { return; }
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: { action: "forgot_password", email: $scope.forgotemail.email },
                crossDomain: true,
                success: function (data) {
                    $scope.isloading = false;
                    $scope.result = { id: 1, msg: 'Password reset instructions has been sent to your email', css: 'successtoolbar' };
                    $scope.$apply();

                },
                error: function (data) {
                    $scope.isloading = false;
                    // alert(jSON.stringify(data));
                    $scope.result = { id: -1, msg: 'Could not send email!', css: 'successtoolbar' };
                    $scope.$apply();

                }
            });
            return true;
        }
        self.validateactivity = function (skipvideo) {
            $scope.newactivityvalidation = { status: true, reason: 'valid' };
            
            if (!$scope.NewActivity.title || $scope.NewActivity.title.toString().length == 0) {
                $scope.newactivityvalidation = { status: false, reason: 'Please enter activity title' };
            }
            if (!$scope.NewActivity.description || $scope.NewActivity.description.toString().length == 0) {
                $scope.newactivityvalidation = { status: false, reason: 'Please enter activity decription' };
            }
            if (!$scope.NewActivity.duration || $scope.NewActivity.duration.toString().length == 0) {
                $scope.newactivityvalidation = { status: false, reason: 'Please select activity duration' };
            }
            if (!$scope.NewActivity.category || $scope.NewActivity.category == '') {
                $scope.newactivityvalidation = { status: false, reason: 'Please select activity category' };
            }
            //alert(JSON.stringify($scope.NewActivity.contestants));
            if ($scope.NewActivity.type == 'battle' && ($scope.NewActivity.contestants.length < 2 || $scope.NewActivity.contestants.length > 5)) {
                $scope.newactivityvalidation = { status: false, reason: 'Number of contestants can be from 2 to 5' };
            }
            
            if ($scope.NewActivity.type=='bracket' && $scope.NewActivity.branchlength <4) {
                $scope.newactivityvalidation = { status: false, reason: 'Number of contestants can be 4, 8, 16' };
            }
            if ( ($scope.NewActivity.type == 'challenge' || $scope.NewActivity.type == 'exhibition') && $('#inputupload').get(0).files.length == 0) {
                if (!skipvideo)
                   {
                    $scope.newactivityvalidation = { status: false, reason: 'Please select video.' };
                    
                }
            }
            if (($scope.NewActivity.type == 'challenge' || $scope.NewActivity.type == 'exhibition') && !$scope.validvideo)
            {
                $scope.newactivityvalidation = { status: false, reason: 'The video is not valid.' };
            }

            for (var i = 0; i < $scope.NewActivity.branches; i++) {
                for (var k = 0; k < $scope.NewActivity.branches[i].contestants; i++) {
                    if ($scope.NewActivity.branches[i].contestants[k].username == '') {
                        $scope.newactivityvalidation = { status: false, reason: 'please fill all users of the branches' };
                    }
                }
            }
        }
        self.addactivity = function (mode) {
            if (mode != 'finish')
                self.validateactivity();
            
            // self.formatnewactivity();
              if ($scope.version44 && ($scope.NewActivity.type == 'challenge' || $scope.NewActivity.type == 'exhibition'))
              {
                  $scope.newactivityvalidation.status == true;
              }
            if ($scope.newactivityvalidation.status) {
                if (mode != 'finish' && ($scope.NewActivity.type == 'challenge' || $scope.NewActivity.type == 'exhibition') &&
                    $scope.isuploading == 0) {
                    $scope.uploadcreateactivity = true;
                    self.initupload();
                    return;
                }
                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
                //console.log(JSON.stringify(self.formatnewactivity()));
                //console.log(access_token);
                data = { action: 'new_activity', activity_data_array: JSON.stringify(self.formatnewactivity()), authorization: "Bearer " + access_token };
                //alert('saving');
                $.ajax({
                    url: "http://www.bracketdash.com/api/api.php",
                    type: 'post',
                    data: data,
                    crossDomain: true,
                    success: function (data) {
                        //console.log(data);
                        var obj = JSON.parse(data);
                        //console.log(obj);
                        if (obj.status == 'success') {
                          

                            $scope.result.id = 1;
                            $scope.result.msg = 'Activity Added Successfuly';
                            $scope.result.css = 'successtoolbar';
                            if ($scope.NewActivity.type == 'challenge' || $scope.NewActivity.type == 'exhibition')
                            {
                                self.getpanel('panel', 'Panel');
                            }
                            else
                                self.getactivityinprogress(self.userinfo.Username, true, 'Activities in progress');
                            $scope.NewActivity = {
                                type: '', title: '', description: '', round: 1, category: 'entertainment', visibility: 'public', duration: '3600', validvideo: true,
                                branchlength: 4, branches: [], contestants: [], video_links: { "webm": null, "ogg": null, "mp4": null, "phone": null, "tablet": null ,thumbnail:null}
                            };
                            
                        }
                        else {
                            $scope.result.id = -1;
                            $scope.result.msg = 'Could not add activity';
                            $scope.result.css = 'errortoolbar';
                        }
                        $scope.$apply();
                    },
                    error: function (data) { alert(JSON.stringify(data)); }
                });
            }
        }
        $scope.newuser = { registeremail: null, registerfullname: null, registerpassword: null, registerusername: null, registerpasswordconfirm: null }
        $scope.registervalidation = { status: true, reason: 'unchecked', usernamestatus: 0,usernametxt:'', emailstatus: 0,emailtxt:'', passwordstatus: 0,passwordtxt:'', passwordconfirmstatus :0,passwordconfirmtxt:'', accepttermstatus:false,accepttermstxt:''};
        $scope.validateemail = function () {
            if (!$scope.newuser.registeremail || $scope.newuser.registeremail.toString().length == 0) {
                $scope.registervalidation.emailstatus = -1;
                $scope.registervalidation.emailtxt = 'Please enter your email address.';
                
            } else {
                $scope.checkmail();
                if ($scope.registervalidation.emailtxt == "Please enter your email address.") $scope.registervalidation.emailtxt = "";
            }
            
        }
        $scope.validateemail2 = function () {
            if (!$scope.changesettings.registeremail || $scope.changesettings.registeremail.toString().length == 0) {
                $scope.registeremailvalidation = 'Please enter your email address.';
            } else {
                $scope.checkmail2();
             
            }

        }
        $scope.validateusername = function () {

            if (!$scope.newuser.registerusername || $scope.newuser.registerusername.toString().length == 0) {
                $scope.registervalidation.usernamestatus = -1;
                $scope.registervalidation.usernametxt = 'Please enter your username.';
            } else {
               // alert(/^[A-Za-z][a-z0-9\-\_\s]+$/i.test($scope.newuser.registerusername));
                if (!/^[A-Za-z][a-z0-9\-\_\s]+$/i.test($scope.newuser.registerusername) || $scope.newuser.registerusername.indexOf(" ") > -1) {
                    $scope.registervalidation.usernamestatus = -1;
                    $scope.registervalidation.usernametxt = 'Please enter a valid username.';
                }
                else {
                    $scope.registervalidation.usernamestatus = 1;
                    if ($scope.registervalidation.usernametxt == "Please enter a valid username.") $scope.registervalidation.usernametxt = "";
                    $scope.checkusername();
                }

            }
        }
        $scope.validateusername2 = function () {
            if (!$scope.changesettings.registerusername || $scope.changesettings.registerusername.toString().length == 0) {

                $scope.changesettings.registerusernamevalid = 'Please enter your username.';
            } else {
                if (!/^[A-Za-z][a-z0-9\-\_\s]+$/i.test($scope.changesettings.registerusername) || $scope.changesettings.registerusername.indexOf(" ") > -1) {
                    $scope.changesettings.registerusernamevalid = 'Please enter a valid username.';
                }
                else {
                    $scope.changesettings.registerusernamevalid = '';
                    $scope.checkusername2();
                }
            }
        }
        $scope.validatepassword = function () {
            if (!$scope.newuser.registerpassword || $scope.newuser.registerpassword.toString().length == 0) {
                $scope.registervalidation.passwordstatus = -1;
                $scope.registervalidation.passwordtxt = 'Please enter your password.';
            }
            else {
                $scope.registervalidation.passwordstatus = 1;
                if ($scope.registervalidation.passwordtxt == "Please enter your password.") $scope.registervalidation.passwordtxt = "";
            }
            
        }
        $scope.validatepasswordconfirm = function () {
            if (!$scope.newuser.registerpasswordconfirm || $scope.newuser.registerpasswordconfirm.toString().length == 0) {
                $scope.registervalidation.passwordconfirmstatus = -1;
                $scope.registervalidation.passwordconfirmtxt = 'Please enter your password.';
            }
            else  if ($scope.newuser.registerpassword != $scope.newuser.registerpasswordconfirm) {
                $scope.registervalidation.passwordconfirmstatus = -1;
                $scope.registervalidation.passwordconfirmtxt = 'Passwords do not match.';
            }
            else
            {
                $scope.registervalidation.passwordconfirmstatus = 1;
                if ($scope.registervalidation.passwordconfirmtxt == "Passwords do not match.") $scope.registervalidation.passwordconfirmtxt = "";
                //$scope.registervalidation.reason = 'Passwords do not match.';
            }
        }
        $scope.checkingemail = false;
        $scope.checkmail = function () {
            $scope.checkingemail = true;
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'post',
                data: { action: 'check_email', Email_Address: $scope.newuser.registeremail, email: $scope.newuser.registeremail },
                crossDomain: true,
                success: function (data) {
                    $scope.checkingemail = false;
                    var obj = JSON.parse(data);
                    if (obj.response.indexOf("Email already in our system") > -1) {
                        
                        $scope.registervalidation.emailstatus = -1;
                        $scope.registervalidation.emailtxt = obj.response;
                    }
                    else {
                        $scope.registervalidation.emailstatus = 1;
                        if ($scope.registervalidation.emailtxt.indexOf("Email already in our system") > -1) $scope.registervalidation.emailtxt = "";
                        
                    }
                    $scope.$apply();
                },
                error: function (data) { alert(JSON.stringify(data)); $scope.isloading = false; }
            });
        }
        $scope.checkmail2 = function () {
            $scope.checkingemail = true;
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'post',
                data: { action: 'check_email', Email_Address: $scope.changesettings.registeremail, email: $scope.changesettings.registeremail },
                crossDomain: true,
                success: function (data) {
                    var obj = JSON.parse(data);
                    if (obj.response.indexOf("Email already in our system") > -1) {

                        $scope.changesettings.registeremailvalid=  obj.response;
                    }
                    else {
                        $scope.changesettings.registeremailvalid = '';
                    }
                    $scope.checkingemail = false;
                    $scope.$apply();
                },
                error: function (data) { alert(JSON.stringify(data)); $scope.isloading = false; }
            });
        }
        $scope.checkingusername = false;
        $scope.checkusername = function () {
            $scope.checkingusername = true;
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'post',
                data: { action: 'check_username', username: $scope.newuser.registerusername },
                crossDomain: true,
                success: function (data) {
                    var obj = JSON.parse(data);
                    $scope.checkingusername = false;
                       
                    if (obj.response.indexOf("already taken") > -1) {
                        $scope.registervalidation.usernamestatus = -1;
                        $scope.registervalidation.usernametxt = obj.response;
                    }
                    else {
                        //$scope.registervalidation.usernamestatus = 1;
                        //$scope.validateusername();
                    }

                    $scope.$apply();
                },
                error: function (data) { alert(JSON.stringify(data)); $scope.isloading = false; }
            });

        }
        $scope.checkusername2 = function () {
            $scope.checkingusername = true;
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'post',
                data: { action: 'check_username', username: $scope.changesettings.registerusername },
                crossDomain: true,
                success: function (data) {
                    var obj = JSON.parse(data);
                    $scope.checkingusername = false;

                    if (obj.response.indexOf("already taken") > -1) {
                        $scope.changesettings.registerusernamevalid = obj.response;
                    }
                    else {
                        $scope.changesettings.registerusernamevalid = '';
                    }

                    $scope.$apply();
                },
                error: function (data) { alert(JSON.stringify(data)); $scope.isloading = false; }
            });

        }
        self.validateregister = function () {
            $scope.validateemail(); $scope.validateusername(); $scope.validatepassword(); $scope.validatepasswordconfirm();
        }
        $scope.register = function () {
            $scope.isloading = true;
            
            if ($scope.registervalidation.status < 1 || $scope.registervalidation.usernamestatus < 1 || $scope.registervalidation.emailstatus < 1
                || $scope.registervalidation.passwordstatus < 1 || $scope.registervalidation.passwordconfirmstatus < 1
                || !$scope.newuser.accepttermstatus) {
                $scope.registervalidation.status = false;
                $scope.isloading = false;
                return;
            }
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'post',
                data: {
                    action: 'signup', email: $scope.newuser.registeremail,
                    fullname: $scope.newuser.registerfullname, username: $scope.newuser.registerusername, password: $scope.newuser.registerusername
                },
                crossDomain: true,
                success: function (data) {
                    $scope.isloading = false;
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);
                    if (obj.request_status == 'success') {
                        var access_token = obj.response.access_token;
                        var exp = obj.response.exp;
                        var username = obj.response.username;
                        self.storetoken(access_token, username, exp, true);
                        
                        if (!$scope.logincallback) {
                            self.getmyprofile(true);
                        }
                        else { self.getmyprofile(false); }

                        self.isloggedin = true;
                        $scope.dialoglogintocontinue.hide();
                        if ($scope.logincallback) {
                            if ($scope.logincallback.fun == "stopped") {
                                self.likevideo($scope.logincallback.p1, $scope.logincallback.p2);
                            }
                        }
                        $scope.$apply();

                    }
                }
            });
            return true;
        }
        $scope.search = function (q) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            $.ajax({
                type: 'POST',
                crossDomain: true,
                url: 'http://www.bracketdash.com/api/api.php',
                data: { action: 'search_activity', searchquery: q, limit: 10,offset:0 },
                success: function (data) {
                    //console.log(data);
                    var obj = JSON.parse(data);
                    $scope.searchresult.activity = obj.search_result;
                    angular.extend($scope.searchresult.activity, obj.search_result);

                    $.ajax({
                        type: 'POST',
                        crossDomain: true,
                        url: 'http://www.bracketdash.com/api/api.php',
                        data: { action: 'search_user', searchquery: q, limit: 10,offset:0 },
                        success: function (userdata) {
                            //console.log(userdata);
                            var objuser = JSON.parse(userdata);
                            $scope.searchresult.people = objuser.search_result;
                            angular.extend($scope.searchresult.people, objuser.search_result);
                            $scope.$apply();
                            self.setMainPage('Search.html', {}, 'Search');

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                        },
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                },
            });
        }
        self.showlogo = function () {
            if (self.issearching == true)
                return false;
            else
                return true;
        }
        //self.feed = [];
        self.feedexpand = -1;
        self.expandfeed = function (id, progress) {
            if (!progress) {
                if (self.feedexpand == id) {
                    $scope.currentfeed = {};
                    $scope.commentdialog.hide();
                    self.feedexpand = -1;
                    //                $scope.$apply();

                }
                else {

                    if (self.CurrentPage == 'Explore' || self.CurrentPage=='Panel') {
                        $scope.currentfeed = $filter('filter')($scope.feed.obj, { activity_id: id }, true)[0];
                    }else
                    {
                        if (self.CurrentPage == 'Single Activity')
                        {
                            $scope.currentfeed = $scope.showsingleactivity;
                        }else
                            $scope.currentfeed = $filter('filter')($scope.viewuserinfo.feedinprogress.obj, { activity_id: id }, true)[0];
                    }
                        self.feedexpand = id;
                        
                        self.getcomments(id);

                        $scope.commentdialog.show();
                        $scope.currentfeed.mode = 1;
                    
                    
                }
            }
            else {

                //if (self.feedexpand == id) {
                //    alert(id);

                //    $scope.currentfeed = {};
                //    $scope.dialoginprogress.hide();
                //    self.feedexpand = -1;
                    
                //}
                //else {
                //alert('jj');

                    self.feedexpand = id;
                    $scope.currentprogressfeed = $filter('filter')($scope.viewuserinfo.feedinprogress.obj, { activity_id: id },true)[0];
                    if ($scope.currentprogressfeed.activity_host_info.username == self.userinfo.Username)
                        $scope.currentprogressfeed.mode = 1;
                    else
                        $scope.currentprogressfeed.mode = 2;

                    $scope.dialoginprogress.show();
                
                    try {

                    } catch (e) { alert(e); }

                    //                $scope.$apply();

                //}
            }
        }
        self.videoexpand = -1;
        self.expandvideo = function (con,activity_id) {
            
            if (self.videoexpand == con.video_id) {
                $scope.currentcon = {};
                $scope.dialogvidoptions.hide();
                self.videoexpand = -1;
                //                $scope.$apply();
                
            }
            else {

                self.videoexpand = con.video_id;
                $scope.currentcon = con;
                $scope.currentcon.activity_id = activity_id;
                $scope.dialogvidoptions.show();
                if (con.contestant_username != self.userinfo.Username)
                    $scope.currentcon.mode = 1;
                if (con.contestant_username == self.userinfo.Username)
                    $scope.currentcon.mode = 2;
                try {

                } catch (e) { alert(e); }
                //                $scope.$apply();

            }
        }
        self.videoexpandinprogress = -1;
        self.expandvideoinprogress = function (con) {

            //if (self.videoexpandinprogress == con.video_id) {
            //    $scope.currentcon = {};
            //    $scope.dialogvidoptions.hide();
            //    self.videoexpand = -1;
            //    //                $scope.$apply();

            //}
            //else {

            self.videoexpandinprogress = con.contestant_username;
                $scope.currentconinprogress = con;
                $scope.dialogvidoptions.show();
                if (con.contestant_username != self.userinfo.Username)
                    $scope.currentconinprogress.mode = 1;
                if (con.contestant_username == self.userinfo.Username)
                    $scope.currentconinprogress.mode = 2;
                try {

                } catch (e) { alert(e); }

                //                $scope.$apply();

            //}
        }
        self.transload = function () {
            $('#upload-form')
            //    .transloadit({
            //    wait: true,
            //    triggerUploadOnFileSelection: true,
            //    autoSubmit: false,

            //    params: {
            //        auth: { key: '622e18e0d81111e5b7ff9bc4624f6488' },
            //        steps: {
            //            resize_to_75: {
            //                robot: '/image/resize',
            //                use: ':original',
            //                width: 75,
            //                height: 75
            //            }
            //        }
            //    },
            //    onSuccess(assembly) {
            //        alert('success' + assembly);
            //        //var url = assembly.results.mp4[0].url;
            //        //var img = assembly.results.resized_thumbs[0].url;
            //        //console.log(url);
            //        //console.log(img);
            //        ////alert(url);
            //        ////alert(img);

            //        //$('.response-thumbnail').html('<div class="play-button" data-vlink="' + url + '"></div><img src="' + img + '">');
            //    }
            //});
        }
        self.deleteactivity = function (id) {

            
            var material;
            var mod = material ? 'material' : undefined;
            ons.notification.confirm({
                message: 'Are you sure you want to delete this activity?',
                modifier: mod,
                callback: function (idx) {
                    switch (idx) {
                        case 0:

                            break;
                        case 1:
                            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                            var data = { "action": "delete_activity", "activity_id": id, authorization: "Bearer " + access_token };

                            $.ajax({
                                url: "http://www.bracketdash.com/api/api.php",
                                type: 'POST',
                                data: data,
                                crossDomain: true,
                                success: function (data) {
                                    //console.log(data);
                                    var obj = JSON.parse(data);
                                    //console.log(obj);
                                    if (obj.status == 'success') {
                                        $scope.result = { id: 1, msg: 'Activity Deleted Successfuly', css: 'successtoolbar' };
                                        self.hidecomments(id);
                                        $scope.dialoginprogress.hide();
                                    }
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                }
                            });
                            return true;
                            break;
                    }
                }
            });


            return true;
        }
        self.launchnextround = function (id) {
           var material;
            var mod = material ? 'material' : undefined;
            ons.notification.confirm({
                message: 'Are you sure you want to launch next round for this activity?',
                modifier: mod,
                callback: function (idx) {
                    switch (idx) {
                        case 0:

                            break;
                        case 1:
                            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                            var data = { "action": "next_bracket_round", "activity_id": $scope.currentfeed.activity_id, authorization: "Bearer " + access_token };

                            $.ajax({
                                url: "http://www.bracketdash.com/api/api.php",
                                type: 'POST',
                                data: data,
                                crossDomain: true,
                                success: function (data) {
                                    //console.log(data);
                                    var obj = JSON.parse(data);
                                    //console.log(obj);
                                    if (obj.status == 'success') {
                                        $scope.result = { id: 1, msg: 'Next Round has been launched for ' + $scope.currentfeed.activity_title, css: 'successtoolbar' };
                                        self.hidecomments(id);
                                    }
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                }
                            });
                            return true;
                            break;
                    }
                }
            });


            return true;
        }
        self.launchactivity = function (id) {


            var material;
            var mod = material ? 'material' : undefined;
            ons.notification.confirm({
                message: 'Are you sure you want to launch this activity?',
                modifier: mod,
                callback: function (idx) {
                    switch (idx) {
                        case 0:

                            break;
                        case 1:
                            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                            var data = { "action": "launch_activity", "activity_id": id, authorization: "Bearer " + access_token };

                            $.ajax({
                                url: "http://www.bracketdash.com/api/api.php",
                                type: 'POST',
                                data: data,
                                crossDomain: true,
                                success: function (data) {
                                    //console.log(data);
                                    var obj = JSON.parse(data);
                                    //console.log(obj);
                                    if (obj == 'done') {
                                        $scope.result = { id: 1, msg: 'Activity Launched Successfuly', css: 'successtoolbar' };
                                        //self.hidecomments(id);
                                        $scope.dialoginprogress.hide();
                                        $scope.$apply();
                                    }
                                    self.getpanel('panel', 'Panel');
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                }
                            });
                            return true;
                            break;
                    }
                }
            });


            return true;
        }
        $scope.joinaudience = function (username) {
                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                var data = { "action": "join_audience", "profile_username": username, authorization: "Bearer " + access_token };

                $.ajax({
                    url: "http://www.bracketdash.com/api/api.php",
                    type: 'POST',
                    data: data,
                    crossDomain: true,
                    success: function (data) {
                            //console.log(data);
                            var obj = JSON.parse(data);
                            //console.log(obj);
                            if (obj == 'success') {
                               // $('#confirmationtoolbar').css('display', 'none');
                                $scope.result = { id: 1, msg: 'You have joined ' + username + ' audience!', css: 'successtoolbar' };
                                //
                               // $scope.getprofile($scope.viewuserinfo.Username, false, $scope.viewuserinfo.mode);
                                $scope.isusernameinarray = true;
                                $scope.$apply();
                            }
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                }
                            });

            return true;
        }
        $scope.acceptjoinaudience = function (username) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var data = { "action": "accept_jar", "profile_username": username, authorization: "Bearer " + access_token };

            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);
                    if (obj.status == 'success') {
                        $scope.result = { id: 1, msg: 'You have joined ' + username, css: 'successtoolbar' };
                                            
                        }

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });

            return true;
        }
        $scope.leaveaudience = function (username) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var data = { "action": "leave_audience", "profile_username": username, authorization: "Bearer " + access_token };
            //$scope.isloading = true;
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);
                    if (obj == 'success') {
                        $scope.result = { id: 1, msg: 'You have left ' + username + ' audience!', css: 'successtoolbar' };
                        $scope.isusernameinarray = false;
                        $scope.$apply();
                    }
                    if (obj == 'error') {
                        $scope.result = { id: 2, msg: 'Sorry, Something went wrong!', css: 'errortoolbar' };
                    }
                    $scope.isloading = false;
                    //$scope.getprofile($scope.viewuserinfo.Username, false, $scope.viewuserinfo.mode);
                    },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                    $scope.isloading = false;
                }
            });

            return true;
        }
        $scope.acceptjoinaudience = function (username) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var data = { "action": "accept_jar", "profile_username": username, authorization: "Bearer " + access_token };
            //$scope.isloading = true;
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);
                    if (obj == 'success') {
                        $scope.result = { id: 1, msg: 'You have joined ' + username + ' audience!', css: 'successtoolbar' };
                       // $scope.isusernameinarray = false;
                        $scope.$apply();
                    }
                    if (obj == 'error') {
                        $scope.result = { id: 2, msg: 'Sorry, Something went wrong!', css: 'errortoolbar' };
                    }
                    $scope.isloading = false;
                    //$scope.getprofile($scope.viewuserinfo.Username, false, $scope.viewuserinfo.mode);
                    var exist = $filter('filter')(self.userinfo.join_audience_requests.obj, { username: username },true).length > 0;
                    if (exist) {
                        var ind = self.userinfo.join_audience_requests.obj.indexOf($filter('filter')(self.userinfo.join_audience_requests.obj, { username: username },true)[0]);
                        self.userinfo.join_audience_requests.obj.splice(ind, 1);
                        $scope.$apply();
                    }
                    
                    
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                    $scope.isloading = false;
                }
            });

            return true;
        }
        $scope.declinejoinaudience = function (username) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var data = { "action": "decline_jar", "profile_username": username, authorization: "Bearer " + access_token };
            //$scope.isloading = true;
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);
                    if (obj == 'success') {
                       // $scope.$apply();
                    }
                    if (obj == 'error') {
                        //$scope.result = { id: 2, msg: 'Sorry, Something went wrong!', css: 'successtoolbar' };
                    }
                    $scope.isloading = false;
                    var exist = $filter('filter')(self.userinfo.join_audience_requests.obj, { username: username },true).length > 0;
                    if (exist) {
                        var ind = self.userinfo.join_audience_requests.obj.indexOf($filter('filter')(self.userinfo.join_audience_requests.obj, { username: username },true)[0]);
                        self.userinfo.join_audience_requests.obj.splice(ind, 1);
                        $scope.$apply();
                    }

                    //$scope.getprofile($scope.viewuserinfo.Username, false, $scope.viewuserinfo.mode);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                    $scope.isloading = false;
                }
            });

            return true;

        }
        self.hidecomments = function (id) {
            if (self.feedexpand == id) {
                $scope.currentfeed = {};
                try { $scope.commentdialog.hide(); } catch (e) { }
                self.feedexpand = -1;
               
            }
         
        }
        self.getcomments = function (id, limit) {
            $scope.isloading = true;
            if (!limit)
                limit = 0;
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'Get',
                data: { action: 'output_comments', activity_id: id, limit: 10, offset:limit },
                crossDomain: true,
                success: function (data) {

                    $scope.isloading = false;
                    $scope.commentslimit = limit;

                    var json_obj = JSON.parse(data);
                    if (json_obj.offset == 0) {
                        $scope.currentfeed.comments = json_obj;
                        angular.extend($scope.currentfeed.comments, json_obj);
                    }
                    else {
                        for (var i = 0; i < json_obj.obj.length; i++)
                        {
                            $scope.currentfeed.comments.obj.push(json_obj.obj[i]);
                        }

                    }
                    if (json_obj.obj.length > 9)
                    {
                        $scope.currentfeed.comments.hasmore = true;
                    }
                    else
                        $scope.currentfeed.comments.hasmore = false;

                    $scope.$apply();
                    
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $scope.isloading = false;
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
        }
        $scope.reportcomment = function (id) {
            var material;
            var mod = material ? 'material' : undefined;
            ons.notification.confirm({
                message: 'Are you sure you want to report this comment?',
                modifier: mod,
                callback: function (idx) {
                    switch (idx) {
                        case 0:

                            break;
                        case 1:
                            $scope.isloading = true;
                            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                            var data = { "action": "report_comment", "rationale": '', "comment_id": id, authorization: "Bearer " + access_token };
                            $.ajax({
                                url: "http://www.bracketdash.com/api/api.php",
                                type: 'POST',
                                data: data,
                                crossDomain: true,
                                success: function (data) {
                                    $scope.isloading = false;
                                    var obj = JSON.parse(data);
                                    $scope.result = { id: 1, msg: 'Thanks we have received your report.', css: 'successtoolbar' };
                                    $scope.$apply();
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    $scope.isloading = false;
                                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                }
                            });
                            break;
                    }
                }
            });
        }
        $scope.deletecomment = function (id) {
            var material;
            var mod = material ? 'material' : undefined;
            ons.notification.confirm({
                message: 'Are you sure you want to delete this comment?',
                modifier: mod,
                callback: function (idx) {
                    switch (idx) {
                        case 0:

                            break;
                        case 1:
                            $scope.isloading = true;
                            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                            var data = { "action": "delete_comment",  "comment_id": id, authorization: "Bearer " + access_token };
                            $.ajax({
                                url: "http://www.bracketdash.com/api/api.php",
                                type: 'POST',
                                data: data,
                                crossDomain: true,
                                success: function (data) {
                                    $scope.isloading = false;
                                    var obj = JSON.parse(data);
                                    var exist = $filter('filter')($scope.currentfeed.comments.obj, { comment_id: id },true)[0];
                                    if (exist) {
                                        var ind = $scope.currentfeed.comments.obj.indexOf($filter('filter')($scope.currentfeed.comments.obj, { comment_id: id },true)[0]);
                                        $scope.currentfeed.comments.obj.splice(ind, 1);
                                        
                                    }
                                    
                                    $scope.result = { id: 1, msg: 'Your comment has been deleted!.', css: 'successtoolbar' };
                                    $scope.$apply();
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    $scope.isloading = false;
                                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                }
                            });
                            break;
                    }
                }
            });
        }
        $scope.exitapp = function (material, id) {
            var mod = material ? 'material' : undefined;
            ons.notification.confirm({
                message: 'Are you sure you want to exit?',
                modifier: mod,
                callback: function (idx) {
                    switch (idx) {
                        case 0:
                            break;
                        case 1:
                            navigator.app.exitApp();
                            break;
                    }
                }
            });
        }
        $scope.invitationrespond = function (material,action, id) {
            var mod = material ? 'material' : undefined;
            ons.notification.confirm({
                message: 'Are you sure you want to '+action+' this invitation?',
                modifier: mod,
                callback: function (idx) {
                    switch (idx) {
                        case 0:

                            break;
                        case 1:
                            $scope.isloading = true;
                            //alert(id);
                            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                            var data = { "action": "input_invitation_response", "response": action, "activity_id": id, authorization: "Bearer " + access_token };
                            $.ajax({
                                url: "http://www.bracketdash.com/api/api.php",
                                type: 'POST',
                                data: data,
                                crossDomain: true,
                                success: function (data) {
                                    $scope.isloading = false;
                                    //var obj = JSON.parse(data);
                                    ons.notification.alert({
                                        message: action == 'accept'? 'You have accepted the invitation.' : 'You have declined the invitation.',
                                        modifier: mod,
                                        callback: function () { $scope.getnotifications(); }
                                    });

                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    $scope.isloading = false;
                                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                }
                            });
                            break;
                    }
                }
            });
        }

        self.showbio = function () {

        }
        $scope.getprofile = function ajax_profile(profile_username, navigate, mode) {

            if (!mode)
                mode = 1;
            if (!$scope.viewuserinfo.Username || $scope.viewuserinfo.Username != profile_username) {
                $scope.isloading = true;
                $.ajax({
                    type: 'GET',
                    url: "http://www.bracketdash.com/api/api.php",
                    data: { action: 'profile_info', profile_username: profile_username },
                    crossDomain: true,
                    success: function (data) {
                        var json_obj = JSON.parse(data);
                        json_obj.mode = mode;
                        $scope.viewuserinfo = json_obj;
                        angular.extend($scope.viewuserinfo, json_obj);
                        $scope.isloading = false;
                        self.isuserinaudience(profile_username);
                        self.getbio(profile_username, navigate);
                        $scope.$apply();
                    },
                    error: function (data) { $scope.isloading = false; }
                });
            }
            else {
                $scope.viewuserinfo.mode = mode;
                self.getbio(profile_username, navigate);

            }

        }
        self.getmyprofile = function ajax_profile(navigate) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                data: { action: 'private_profile_info', profile_username: localStorage.profile_username, authorization: "Bearer " + access_token  },
                crossDomain: true,
                success: function (data) {
                    var json_obj = JSON.parse(data);

                    self.getsettings(navigate);
                    self.userinfo = json_obj;
                    angular.extend(self.userinfo, json_obj);
                    $scope.changesettings = {
                        registeremail: self.userinfo.Email, registerpassword: null,
                        registerusername: self.userinfo.Username, registerpasswordconfirm: null, registeroldpassword: null,
                        registeremailvalid: '', registerusernamevalid: '', confirmpassword: '',registerpasswordvalid: ''
                    }

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
                data: { action: 'search_username', searchquery: q, limit: 5,offset:0 },
                crossDomain: true,
                success: function (data) {
                    var json_obj = JSON.parse(data);
                    //console.log(data);
                    for (var i = 0; i < json_obj.search_result.length; i++) {
                        json_obj.search_result[i].selected = false;

                        if (!$scope.NewActivity.type) {
                            $scope.usersearchresult.push(json_obj.search_result[i]);
                        }

                        if ($scope.NewActivity.type == 'battle') {
                            var exist = $filter('filter')($scope.NewActivity.contestants, { Username: json_obj.search_result[i].Username },true).length > 0;
                            if (exist)
                            {
                                var ind = $scope.NewActivity.contestants.indexOf(user);
                                $scope.NewActivity.contestants.splice(ind, 1);
                                $scope.usersearchresult.push(user);
                            }
                        }
                        if ($scope.NewActivity.type == 'bracket') {
                            //alert($scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Username);
                            if ($scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Username.length > 0)
                            {
                                var exist = $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Username === json_obj.search_result[i].Username;
                               // alert(exist);
                                if (!exist) {
                                    
                                    //var ind = $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants.indexOf(user);
                                    //$scope.NewActivity.contestants.splice(ind, 1);
                                    $scope.usersearchresult.push(json_obj.search_result[i]);
                                }
                            }
                        }

                        

                    }
                    
                    $scope.usersearchresult = json_obj.search_result;
                    angular.extend($scope.usersearchresult, json_obj.search_result);
                    $scope.$apply();

                }
            });


        }
        $scope.showuserlist = function ($event, userlist) {
            $scope.userlist = userlist;
            $scope.popoveruserlist.show($event);

        }
        self.popselectuser = function ($event, branch_no, userindex) {
            //self.overlaylement('selectcontestants', 'popselect', -20, -20, 0, 0, null, null, 'slide-right');
            $scope.searchuserquery = {};
            if ($scope.NewActivity.type == 'battle') {
                //alert(JSON.stringify($scope.NewActivity.contestants));
                //$scope.usersearchresult = $scope.NewActivity.contestants;
            }
            else {

                $scope.usersearchresult = [];
                $scope.currentbranchuser.branch_no = branch_no;
                $scope.currentbranchuser.userindex = userindex;
                if ($scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Username.length > 0) {
                    //alert('there is user');
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].selected = true;
                  //  $scope.usersearchresult.push($scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex]);
                }
            }
            //$scope.popoveruserselect.show($event);
            $scope.dialoguserselect.show($event);

        }
        $scope.checkuser = function ($event, user) {
            try {
               
            if ($scope.NewActivity.type == 'bracket') {
                if (user.selected) {
                    if ($scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[0].Username == user.Username || $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[1].Username == user.Username) {
                        alert('Please select two different users!');
                        return;
                    }
                    //$scope.usersearchresult.push($scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex]);
                    if ($scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Username.length > 0)
                    {
                        $scope.usersearchresult.push({
                            Username: $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Username,
                            Avatar_link: $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Avatar_link,
                            Fullname: $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Fullname,
                            selected: false
                        });
                    }
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Username = user.Username;
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Avatar_link = user.Avatar_link;
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Fullname = user.Fullname;
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].selected = true;
                    //$scope.popoveruserselect.hide($event);
                    //alert(JSON.stringify());

                    var selecteduser = $filter('filter')($scope.usersearchresult, { Username: user.Username },true)[0];
                    var ind = $scope.usersearchresult.indexOf(selecteduser);
                    $scope.usersearchresult.splice(ind, 1);
                    //$scope.$apply();

                }
                else {

                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Username = '';
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Avatar_link = '';
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Fullname = '';
                    //$scope.usersearchresult = [];

                }
            }
            if ($scope.NewActivity.type == 'battle') {
                var exist = $filter('filter')($scope.NewActivity.contestants, { Username: user.Username },true).length > 0;
                var newuser = { Username: user.Username, Avatar_link: user.Avatar_link, Fullname: user.Fullname, selected: true };
                if (exist && !user.selected) {
                    var ind = $scope.NewActivity.contestants.indexOf(user);
                    $scope.NewActivity.contestants.splice(ind, 1);
                    $scope.usersearchresult.push(user);
                }
                else {
                    if (user.selected == true) {
                        $scope.NewActivity.contestants.push(newuser);

                        var selecteduser = $filter('filter')($scope.usersearchresult, { Username: user.Username },true)[0];
                        var ind = $scope.usersearchresult.indexOf(selecteduser);
                        $scope.usersearchresult.splice(ind, 1);
                        //alert(JSON.stringify($scope.user));
                    }
                }
            }
            $scope.searchuserquery.q = '';
            
                 } catch (e) {alert(e); }
        }
        $scope.startreplaceuser = function ($event, con, activity_id) {
            
            $scope.replaceolduser = { username: con.contestant_username }
            $scope.replaceuser_activity = activity_id;
            $scope.dialoguserreplace.show($event);
        }
        $scope.replaceuser = function ($event, user) {
            var newuser = { Username: user.Username, Avatar_link: user.Avatar_link, Fullname: user.Fullname, selected: true };
            $scope.searchuserquery.q = '';
            var material;
            var mod = material ? 'material' : undefined;
            ons.notification.confirm({
                message: 'Are you sure you want to replace \'' + $scope.replaceolduser.username + '\' with \''+ newuser.Username +'\' ?',
                modifier: mod,
                callback: function (idx) {
                    switch (idx) {
                        case 0:

                            break;
                        case 1:
                            $scope.isloading = true;
                            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                            var data = { "action": "replace_contestant", "activity_id": $scope.replaceuser_activity , 
                                current_contestant_username: $scope.replaceolduser.username, new_contestant_username: newuser.Username, 
                                authorization: "Bearer " + access_token
                            };
                            $.ajax({
                                url: "http://www.bracketdash.com/api/api.php",
                                type: 'POST',
                                data: data,
                                crossDomain: true,
                                success: function (data) {
                                    $scope.isloading = false;
                                    //console.log(data);
                                    var obj = JSON.parse(data);
                                    //console.log(obj);
                                    if (obj.status == 'success') {
                                        //self.getcomments($scope.currentfeed.activity_id);
                                        //doChange('#profile');
                                        $scope.newreport = {};
                                        $scope.result.id = 1;
                                        $scope.result.msg = 'Contestant replaced!';
                                        $scope.result.css = 'successtoolbar';
                                        $scope.dialoguserreplace.hide();
                                        self.getactivityinprogress(self.userinfo.Username, false, 'Activities in progress');
                                    }

                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    $scope.isloading = false;
                                    $scope.newcomment = {};
                                    $scope.result.id = -1;
                                    $scope.result.msg = 'User was not replaced';
                                    $scope.result.css = 'errortoolbar';

                                    $scope.dialoguserreplace.hide();
                                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                }
                            });
                            return true;
                            break;
                    }
                }
            });
        }
        self.getbio = function ajax_bio(profile_username, navigate) {
            if (profile_username == null) {
                //console.log("self.userinfo" + JSON.stringify(self.userinfo))
                profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
                $scope.viewuserinfo = self.userinfo;
                //console.log("viewuserinfo" + JSON.stringify($scope.viewuserinfo))

            }
            else {
                //self.getprofile(profile_username);
            }
            if (!$scope.viewuserinfo.Username || $scope.viewuserinfo.Username != profile_username || !$scope.viewuserinfo.bio) {

                $scope.isloading = true;
                $.ajax({
                    type: 'GET',
                    url: "http://www.bracketdash.com/api/api.php",
                    data: { action: 'bio', profile_username: profile_username },
                    crossDomain: true,
                    success: function (data) {

                        var json_obj = JSON.parse(data);
                        //console.log(JSON.stringify(json_obj))
                        $scope.viewuserinfo.bio = json_obj;

                        angular.extend($scope.viewuserinfo.bio, json_obj);
                        //console.log("bio" + JSON.stringify($scope.viewuserinfo.bio))
                        //self.setMainPage('BioContent.html', { closeMenu: true }, "Bio");
                        $scope.isloading = false;
                        if (navigate && $scope.viewuserinfo.mode == 1)
                            self.setMainPage('BioContent.html', { closeMenu: true }, 'BioContent');

                        self.getaudience(profile_username, false);

                    },
                    error: function (data) {
                        $scope.isloading = false;
                    }
                });
            }
            else {
                self.setMainPage('BioContent.html', { closeMenu: true }, 'BioContent');
            }

        }
        self.getfeed = function (action, title, limit) {
            try {
                self.collapseall();
                if (!limit)
                    limit = 0;
                
                $scope.isloading = true;
                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
                $.ajax({
                    type: 'GET',
                    url: "http://www.bracketdash.com/api/api.php",
                    data: { action: action, limit: 10, offset: limit, session_username: profile_username },
                    crossDomain: true,
                    success: function (data) {
                        //console.log(data);
                        var json_obj = JSON.parse(data);
                        //console.log(json_obj);
                        var obj = json_obj.obj;
                        //console.log(obj);
                        $scope.feedlimit = parseInt(json_obj.offset);
                        try {
                            if (json_obj.offset == 0) {
                                $scope.feed = json_obj;
                                angular.extend($scope.feed, json_obj);
                                self.setMainPage('page1.html', { closeMenu: true }, title);
                            } else {
                                
                                for (var i = 0; i < json_obj.obj.length; i++) {
                                    $scope.feed.obj.push(json_obj.obj[i]);
                                }
                                
                            }
                            if (obj.length == 0) {
                                $scope.feed.hasmore = false;
                            } else
                                $scope.feed.hasmore = true;
                            
                            $scope.isloading = false;
                            $("#body").css("visibility", "visible");
                            $scope.$apply();
                        } catch (e) { alert(e);}
                    },
                    error: function (data) {
                        alert(JSON.stringify(data));
                        $scope.isloading = false;
                    }
                });
            } catch (e) { alert(e); }
        }
        self.loadmorefeed = function () {
            try {
                return;
                $scope.isloading = true;
                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
                $.ajax({
                    type: 'GET',
                    url: "http://www.bracketdash.com/api/api.php",
                    data: { action: action, limit: 10 },
                    crossDomain: true,
                    success: function (data) {

                        //console.log(data);
                        var json_obj = JSON.parse(data);
                        //console.log(json_obj);
                        var obj = json_obj.obj;
                        //console.log(obj);
                        $scope.feed = json_obj.obj;
                        angular.extend($scope.feed, json_obj.obj);

                        self.setMainPage('page1.html', { closeMenu: true }, title);
                        $scope.isloading = false;
                    },
                    error: function (data) {
                        alert(JSON.stringify(data));
                        $scope.isloading = false;
                    }
                });
            } catch (e) { alert(e); }
        }
        self.getpanel = function (action, title,limit) {
            self.collapseall();
            $scope.isloading = true;
            if (!limit)
                limit = 0;

            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            var data = { action: 'panel', profile_username: profile_username, limit: 10,offset: limit, authorization: "Bearer " + access_token };
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",

                data: data,
                crossDomain: true,
                success: function (data) {
                    //console.log(data);
                    var json_obj = JSON.parse(data);
                    //console.log(json_obj);
                    var obj = json_obj.obj;
                    //console.log(obj);
                    $scope.feedlimit = parseInt(json_obj.offset);
                    try {
                        if (json_obj.offset == 0) {
                            $scope.feed = json_obj;
                            angular.extend($scope.feed, json_obj);
                            self.setMainPage('page1.html', { closeMenu: true }, title);
                        } else {

                            for (var i = 0; i < json_obj.obj.length; i++) {
                                $scope.feed.obj.push(json_obj.obj[i]);
                            }

                        }
                        if (json_obj.obj.length > 9) {
                            $scope.feed.hasmore = true;
                        } else
                            $scope.feed.hasmore = false;

                        $scope.isloading = false;
                        $scope.$apply();
                    } catch (e) { alert(e); }
                },
                error: function (data) {
                    $scope.isloading = false;
                }
            });
        }
        self.getactivityinprogress = function (username, navigate, title, limit) {
            if (!limit)
                limit = 0;

            //alert(self.userinfo.Username);

            //alert(JSON.stringify($scope.viewuserinfo.Username));
            //if (username == self.userinfo.Username && !$scope.viewuserinfo.Username)
            //{
            //    $scope.getprofile(username, true, 4);
            //    return;
            //}
            $scope.viewuserinfo = self.userinfo;
            $scope.isloading = true;

            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            //var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            var data = { action: 'activity_in_progress', profile_username: username, limit: 10, offset: limit, authorization: "Bearer " + access_token };
            $scope.isloading = true;
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                data: data,
                crossDomain: true,
                success: function (data) {
                    var json_obj = JSON.parse(data);
                    var obj = json_obj.obj;

                    $scope.feedlimit = parseInt(json_obj.offset);
                    try {
                        //alert(JSON.stringify(json_obj));
                        if (json_obj.offset == 0) {
                            $scope.viewuserinfo.feedinprogress = json_obj;
                            angular.extend($scope.viewuserinfo.feedinprogress, json_obj);
                            self.setMainPage('myfeed.html', { closeMenu: true }, title);
                        } else {

                            for (var i = 0; i < json_obj.obj.length; i++) {
                                $scope.viewuserinfo.feedinprogress.obj.push(json_obj.obj[i]);
                            }

                        }
                        if (json_obj.obj.length > 9) {
                            $scope.viewuserinfo.feedinprogress.hasmore = true;
                        } else
                            $scope.viewuserinfo.feedinprogress.hasmore = false;

                        $scope.isloading = false;
                        $scope.$apply();
                    } catch (e) { alert(e); }

                    //$scope.viewuserinfo.feedinprogress = json_obj;
                    //angular.extend($scope.viewuserinfo.feedinprogress, json_obj);
                    




                    //if (navigate || $scope.viewuserinfo.mode ==4)
                    //    self.setMainPage('myfeed.html', { closeMenu: true }, title);

                    $scope.isloading = false;
                },
                error: function (data) {
                    $scope.isloading = false;
                }
            });
        }
        self.getactivitylog = function (username, navigate, title, limit) {
            
            if (!limit)
                limit = 0;
            if ((self.userinfo && username == self.userinfo.Username && !$scope.viewuserinfo.Username) || $scope.viewuserinfo.Username != username) {
                $scope.getprofile(username, true, 4);
                return;
            }
            $scope.isloading = true;
            try{$scope.$apply();}catch(e){}

            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            //var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            var data = {
                action: 'activity_log', profile_username: username.toString(), limit: 10, offset: limit,
                authorization: "Bearer " + access_token, session_username: self.userinfo ? self.userinfo.Username : ''
            };
            //$scope.isloading = true;
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",

                data: data,
                crossDomain: true,
                success: function (data) {
                    $scope.isloading = false;
                    try {
                        var json_obj = JSON.parse(data);
                        var obj = json_obj.obj;
                        $scope.feedlimit = parseInt(json_obj.offset);
                        if (json_obj.offset == 0) {
                            $scope.viewuserinfo.feedinprogress = json_obj;
                            angular.extend($scope.viewuserinfo.feedinprogress, json_obj);
                            //alert($scope.viewuserinfo.mode)
                            if (navigate && $scope.viewuserinfo.mode == 3)
                                self.setMainPage('BioContent.html', { closeMenu: true }, 'BioContent');
                        } else {

                            for (var i = 0; i < json_obj.obj.length; i++) {
                                $scope.viewuserinfo.feedinprogress.obj.push(json_obj.obj[i]);
                            }

                        }
                        if (json_obj.obj.length > 9) {
                            $scope.viewuserinfo.feedinprogress.hasmore = true;
                        } else
                            $scope.viewuserinfo.feedinprogress.hasmore = false;

                        //alert(navigate);
                        if (navigate && $scope.viewuserinfo.mode == 3)
                            self.setMainPage('BioContent.html', { closeMenu: true }, 'Activities');
                        $scope.$apply();
                    } catch (e) { alert(e);}
                },
                error: function (data) {
                    $scope.isloading = false; $scope.$apply();

                }
            });
        }
        self.getsingleactivity = function (activity_id, title) {
            $scope.isloading = true;
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            var data = { action: "output_activity", activity_id: activity_id, session_username : profile_username };
            $('#confirmationtoolbar').css('display','none');
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",

                data: data,
                crossDomain: true,
                success: function (data) {
                    //console.log(data);
                    var json_obj = JSON.parse(data);
                    $scope.showsingleactivity = json_obj;
                    angular.extend($scope.showsingleactivity, json_obj);
                    //alert(title);
                    if (title == 'Invitation')
                    { $scope.showsingleactivity.isinvitation = true;}
                    self.setMainPage('SingleActivity.html', { closeMenu: true }, title);
                    $scope.isloading = false;
                    //$scope.invitationdialog.show();
                },
                error: function (data) {
                    $scope.isloading = false;
                }
            });
        }
        self.getinvitation = function (activity_id, title) {
            $scope.isloading = true;
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            var data = { action: "output_invitation", activity_id: activity_id, authorization: "Bearer " + access_token };
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",

                data: data,
                crossDomain: true,
                success: function (data) {
                    //console.log(data);
                    var json_obj = JSON.parse(data);
                    $scope.showsingleactivity = json_obj;
                    angular.extend($scope.showsingleactivity, json_obj);
                    //alert(title);
                    $('#confirmationtoolbar').css('display', 'none');
                    if (title == 'Invitation')
                    { $scope.showsingleactivity.isinvitation = true; }
                    self.setMainPage('SingleActivity.html', { closeMenu: true }, title);
                    $scope.isloading = false;
                    //$scope.invitationdialog.show();
                },
                error: function (data) {
                    $scope.isloading = false;
                }
            });
        }

        self.marknotificationseen = function (notificationid) {
            $scope.isloading = true;
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            var data = { action: "mark_seen_notification", notification_id: notificationid, authorization: "Bearer " + access_token };
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",

                data: data,
                crossDomain: true,
                success: function (data) {
                    self.userinfo.notification_no = self.userinfo.notification_no - 1;
                    try { $scope.$apply(); } catch (e) { }
                },
                error: function (data) {
                    $scope.isloading = false;
                }
            });
        }

        self.gotoactivityinprogress = function (notificationid) {
            var material;
            var mod = material ? 'material' : undefined;
            ons.notification.confirm({
                message: 'In order to view these changes go to activities in progress!',
                modifier: mod,
                callback: function (idx) {
                    switch (idx) {
                        case 0:

                            break;
                        case 1:
                            self.marknotificationseen(notificationid);
                            self.getactivityinprogress(self.userinfo.Username, true, 'In Progress');
                            return true;
                            break;
                    }
                }
            });
        }
        self.getaudience = function ajax_audience(username, navigate, limit) {
            if (!limit)
                limit = 0;

            $scope.isloading = true;
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                crossDomain: true,
                data: { action: 'audience', profile_username: username, limit: 10,offset:limit },
                success: function (data) {
                    var json_obj = JSON.parse(data);
                    var obj = json_obj.obj;
                    

                    $scope.audiencelimit = parseInt(json_obj.offset);

                    if (json_obj.offset == 0) {
                        $scope.viewuserinfo.audience = json_obj.obj;
                        angular.extend($scope.viewuserinfo.audience, json_obj.obj);

                        if (navigate && $scope.viewuserinfo.mode == 2)
                            self.setMainPage('BioContent.html', { closeMenu: true }, 'Audience');

                        self.getactivitylog(username, true);

                        } else {

                            for (var i = 0; i < json_obj.obj.length; i++) {
                                $scope.viewuserinfo.audience.push(json_obj.obj[i]);
                            }

                    }
                    if (json_obj.obj.length > 9) {
                            $scope.viewuserinfo.audience.hasmore = true;
                        } else
                            $scope.viewuserinfo.audience.hasmore = false;
                    
                    //alert(JSON.stringify(json_obj.obj));
                    if ($filter('filter')($scope.viewuserinfo.audience, { Username: self.userinfo.Username },true).length > 0) {
                      //  alert(self.userinfo.Username);
                        $scope.isusernameinarray = true;
                    }
                    else {
                        //alert(self.userinfo.Username);
                    $scope.isusernameinarray = false;
                }
                   
                    $scope.isloading = false;
                    $scope.$apply();

                },
                error: function (data) {
                    $scope.isloading = false;
                }
            });
        }
        self.isuserinaudience = function ajax_join_audience_status(profile_username) {
                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                
                $.ajax({
                    type: 'GET',
                    url: "http://www.bracketdash.com/api/api.php",

                    data: { action: 'join_audience_status', profile_username: profile_username, authorization: "Bearer " + access_token },
                    crossDomain: true,
                    success: function (data) {
                        if (data.status == "leave")
                            $scope.isusernameinarray = true;
                        if (data.status == "join")
                            $scope.isusernameinarray = false;
                        var json_obj = JSON.parse(data);
                        $scope.isloading = false;
                        $scope.$apply();
                        //$scope.invitationdialog.show();
                    },
                    error: function (data) {
                        $scope.isloading = false;
                    }
                });
            
        }
        $scope.playvideo = function (videolink) {
            if (videolink && videolink.indexOf("http") > -1)
                $scope.isplaying = $sce.trustAsResourceUrl(videolink);
                else
                $scope.isplaying = videolink;

        }
        $scope.closevideo = function () {


        }
        $scope.triggervideoupload = function () { $('#inputupload').trigger('click');; }
        $scope.triggerresponseupload = function () { $('#inputuploadresponse').trigger('click');; }
        $scope.triggerprogressupload = function (id) {
            if ($scope.isuploading == 1)
            {
                ons.notification.alert({
                    message: 'There is an upload in progress please try later'
                });
                return;
            }
            $scope.uploadactivityid = id;
            $('#inputuploadprogress').trigger('click');;
        }
        $scope.triggerimageupload = function () {
            $('#inputprofileimg').trigger('click');;
               
        }
        $scope.showdialogprofilepic = function () {
            // alert(self.userinfo.Avatar_link);
            
            //$scope.getimagebase64(self.userinfo.Avatar_link, $scope.cropper);
            $('.rotate-cw').click(function () {
                $('.image-editor').cropit('rotateCW');
            });
            $('.rotate-ccw').click(function () {
                $('.image-editor').cropit('rotateCCW');
            });
            //$('.upload').on('click', function () {
            //    $('.upload').unbind('click');

            //});
            $('#btnupload').on('click', function () {
                //alert('');
                
            });

            $('#btnuploadresponse').on('click', function () {
                $('#inputuploadresponse').trigger('click');;
            });
            $('.export').click(function () {
                var imageData = $('.image-editor').cropit('export');
                //$scope.profilepicbase64 = imageData;
                //alert($scope.profilepicbase64);
                $scope.saveprofilepicture(imageData);
                // $scope.$apply();
            });
            //var avatar_link = $(this).attr("data-avatar-link");
            //if (avatar_link) {
            //var edit_profile_view = profile_image_cropit_template();
            //call_light_box(edit_profile_view, 'on');
            //$('.image-editor').cropit('imageSrc', 'http://lorempixel.com/500/400/');
              
            //process_profile_image();
            //}
            //$scope.getimagebase64(self.userinfo.Avatar_link, $scope.cropit);
            $scope.cropit(self.userinfo.Avatar_link);

            //$scope.cropit('data:image/png;base64,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');

            //$scope.cropit($scope.imagetobase64("myprofilepic"));
            //$scope.cropit('data:image/png;base64,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');
            $scope.dialogprofilepic.show();
          
        }
        $scope.cropit = function (src) {
            $('.image-editor').cropit({
                imageBackground: true,
                imageBackgroundBorderWidth: 10,
                imageState: {
                    src: src
                },
            });
        }
        $scope.saveprofilepicture = function save_profile_picture(profile_picture_file) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            $scope.isloading = true;
            $scope.$apply();
            $.ajax({
                type: 'POST',
                url: "https://www.bracketdash.com/api/api.php",
                data: { action: 'save_profile_picture', profile_picture_file: profile_picture_file, authorization: "Bearer " + access_token },
                success: function (data) {
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);
                    $scope.dialogprofilepic.hide();
                    $scope.result.id = 1;
                    $scope.result.msg = 'Profile Picture Updated!';
                    $scope.result.css = 'successtoolbar';
                    //self.getmyprofile(false);
                    var cb = new Date();

                    self.userinfo.Avatar_link = self.userinfo.Avatar_link + '?date=' + cb;
                    try { $scope.$apply(); } catch (e) { }
                    try { 
                    window.cache.clear(function () { return true; }, function (e) { return false;});
                    window.cache.cleartemp();
                    } catch (e) { }
                    try { 
                        if ($scope.isbrowser)
                            window.location.reload(true);
                    } catch (e) { }
                    //alert($scope.isloading);
                    //alert($scope.CurrentPageAddress, $scope.CurrentPage);
                    self.setMainPage($scope.CurrentPageAddress, { closeMenu: false }, $scope.CurrentPage);
                    
                    $scope.isloading = false;
                    
                    //for (var i = 0; i < $scope.feed.obj.length; i++)
                    //{
                    //    try {
                    //        alert($scope.feed.obj[i].activity_host_info.avatar_link);
                    //        $scope.feed.obj[i].activity_host_info.avatar_link = $scope.feed.obj[i].activity_host_info.avatar_link + '?date=' + cb;
                    //    } catch (e) { }
                    //    try {
                    //        for (var j = 0; j < $scope.feed.obj[i].contestants_info.length; j++) {
                    //            try {
                    //                $scope.feed.obj[i].contestants_info[j].avatar_link = $scope.feed.obj[i].contestants_info[j].avatar_link + '?date=' + cb;
                    //            } catch (e) { }
                    //            try {
                    //                $scope.feed.obj[i].contestants_info[j].challenge.avatar_link = $scope.feed.obj[i].contestants_info[j].challenge.avatar_link + '?date=' + cb;
                    //            } catch (e) { }
                    //            try {
                    //                for (var k = 0; k < $scope.feed.obj[i].contestants_info[j].response.length; j++) {
                    //                    $scope.feed.obj[i].contestants_info[j].response[k].avatar_link = $scope.feed.obj[i].contestants_info[j].response[k].avatar_link + '?date=' + cb;
                    //                }
                    //            } catch (e) { }


                    //        }
                    //    } catch (e) { }
                    //}
                    //if ($scope.viewuserinfo && $scope.viewuserinfo.feedinprogress)
                    //    {
                    //for (var i = 0; i < $scope.viewuserinfo.feedinprogress.obj.length; i++) {
                    //    try {
                    //        $scope.viewuserinfo.feedinprogress.obj[i].activity_host_info.avatar_link = $scope.viewuserinfo.feedinprogress.obj[i].activity_host_info.avatar_link + '?date=' + cb;
                    //    } catch (e) { }
                    //    try {
                    //        for (var j = 0; j < $scope.viewuserinfo.feedinprogress.obj[i].contestants_info.length; j++) {
                    //            try {
                    //                $scope.viewuserinfo.feedinprogress.obj[i].contestants_info[j].avatar_link = $scope.viewuserinfo.feedinprogress.obj[i].contestants_info[j].avatar_link + '?date=' + cb;
                    //            } catch (e) { }
                    //            try {
                    //                $scope.viewuserinfo.feedinprogress.obj[i].contestants_info[j].challenge.avatar_link = $scope.viewuserinfo.feedinprogress.obj[i].contestants_info[j].challenge.avatar_link + '?date=' + cb;
                    //            } catch (e) { }
                    //            try {
                    //                for (var k = 0; k < $scope.viewuserinfo.feedinprogress.obj[i].contestants_info[j].response.length; j++) {
                    //                    $scope.viewuserinfo.feedinprogress.obj[i].contestants_info[j].response[k].avatar_link = $scope.viewuserinfo.feedinprogress.obj[i].contestants_info[j].response[k].avatar_link + '?date=' + cb;
                    //                }
                    //            } catch (e) { }


                    //        }
                    //    } catch (e) { }
                    //}
                    //}
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                    $scope.isloading = false;

                },
                crossDomain: true,
            });
        }
        $scope.getCroppedCanvas = function () {
            //alert(JSON.stringify());
            try {
                var option1;
                var option2;
                        $("#image").cropper('getCroppedCanvas',option1,option2).toDataUrl();
                   
            } catch (e) { alert(e); }
            
        }
        $scope.imagetobase64 = function toDataUrl(id){
            var c = document.getElementById("myCanvas");
            var ctx = c.getContext("2d");
            var img = document.getElementById(id);
            ctx.drawImage(img, 10, 10);
            }
        $scope.getnotifications = function (limit) {
            self.collapseall();
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            if (!limit)
                limit = 0;
            $scope.isloading = true;
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                crossDomain: true,
                data: {
                    action: 'output_notifications',
                    limit: 10,
                    offset: limit,
                    authorization: "Bearer " + access_token
                },
                success: function (data) {
                    //$scope.notificationlimit = limit;
                    var json_obj = JSON.parse(data);
                   
                    $scope.notificationlimit = parseInt(json_obj.offset);

                    if (json_obj.offset == 0) {
                        $scope.notifications = json_obj;
                        angular.extend($scope.notifications, json_obj);
                        self.setMainPage('Notifications.html', { closeMenu: true }, 'Notifications');

                    } else {

                        for (var i = 0; i < json_obj.obj.length; i++) {
                            $scope.notifications.obj.push(json_obj.obj[i]);
                        }

                    }
                    if (json_obj.obj.length > 9) {
                        $scope.notifications.hasmore = true;
                    } else
                        $scope.notifications.hasmore = false;


                    $scope.isloading = false;
                    $scope.$apply();

                   
                }
            });
        }
        $scope.getmessages = function (limit) {
            self.collapseall();
            $scope.isloading = true;
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            //self.setMainPage('Messages.html', { closeMenu: true }, 'Messages')
            //return;
            
            
            if (!limit)
                limit = 0;
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                crossDomain: true,
                data: {
                    action: 'output_inbox',
                    limit: 10,
                    offset: limit,
                    authorization: "Bearer " + access_token
                },
                success: function (data) {
                    //alert(data);
                   
                    $scope.isloading = false;
                    var json_obj = JSON.parse(data);
                    $scope.messageslimit = parseInt(json_obj.offset);

                    if (json_obj.offset == 0) {
                        $scope.messages = json_obj;
                        angular.extend($scope.messages, json_obj);
                        
                            self.setMainPage('Messages.html', { closeMenu: true }, 'Messages');
                    } else {

                            for (var i = 0; i < json_obj.obj.length; i++) {
                                $scope.messages.obj.push(json_obj.obj[i]);
                            }

                    }
                    if (json_obj.obj.length >9) {
                        $scope.messages.hasmore = true;
                    } else
                        $scope.messages.hasmore = false;


                    $scope.isloading = false;
                    $scope.$apply();
                    
                },
                error: function (data) { $scope.isloading = false; }
            });
        }
        $scope.getconversation = function (id, limit) {
            if (!limit)
                limit = 0;
            //alert(id);
            //alert(limit);
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            //$scope.CurrentConversation = { from: {Username: 'eliezer', Fullname:'Eliezer Kombe',Avatar_link:''},
            //    messages: [{ from: { Username: 'eliezer', Fullname: 'Eliezer Kombe', Avatar_link: 'https://bracketdash-users.s3.amazonaws.com/1/profile-picture.jpg' }, text: 'A message', date: '10/10/2013' },
            //        { from: { Username: 'eliezer', Fullname: 'Eliezer Kombe', Avatar_link: 'https://bracketdash-users.s3.amazonaws.com/1/profile-picture.jpg' }, text: 'Another message', date: '10/10/2013' }]
            //}
            //return;
            $scope.CurrentConversation.with = "";
            $scope.currentconversationid = id;
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                crossDomain: true,
                data: {
                    action: 'output_conversation',
                    limit: 10,
                    offset: limit,
                    conversation_id: id,
                    authorization: "Bearer " + access_token
                },
                success: function (data) {
                    //alert(data);
                    var json_obj = JSON.parse(data);
                    $scope.conversationlimit = json_obj.offset;
                    if (json_obj.offset == 0) {
                        json_obj.obj = json_obj.obj.sort().reverse();
                        $scope.CurrentConversation = json_obj;
                        angular.extend($scope.CurrentConversation, json_obj);
                        var group = json_obj.chat_group;// $filter('filter')($scope.CurrentConversation.obj, { username: '!' + self.userinfo.Username }, true);
                        for (var j = 0; j < group.length; j++)
                        {
                            if (!$scope.CurrentConversation.with)
                            {
                                $scope.CurrentConversation.with = "";
                              
                            }
                            if (group[j] && group[j] !='undefined')
                                $scope.CurrentConversation.with += group[j]
                            if (j < group.length-1)
                                $scope.CurrentConversation.with += ", ";
                        }
                        
                        self.setMainPage('Conversation.html', { closeMenu: true }, 'Conversation');
                        setTimeout(function () { $("#lstmessages").animate({
                            scrollTop: 1200
                        }); }, 2000);

                    } else {
                        
                        for (var i = 0; i < json_obj.obj.length; i++) {
                            $scope.CurrentConversation.obj.unshift(json_obj.obj[i]);
                        }
                        setTimeout(function () {
                            $("#lstmessages").animate({
                                scrollTop: 0
                            });
                        }, 1000);

                    }
                    if (json_obj.obj.length > 9) {
                        {
                            $scope.CurrentConversation.hasmore = true;
                           }
                    } else{
                        $scope.CurrentConversation.hasmore = false;  
                    }
                    $scope.isloading = false;
                    $scope.$apply();

                }
            });
        }
        $scope.sendmessage = function () {
            if (!$scope.compose.message || $scope.compose.message.length == 0) {
                $scope.messageempty = true;

                return;
            }
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var privacysettings = { join_audience_settings: self.userinfo.accountsettings.join_audience_settings }
            var destinationarray = $scope.compose.usernames;
            //alert(destinationarray);
            //alert(JSON.stringify(destinationarray));
            var data = { action: 'input_message', destination: JSON.stringify(destinationarray), text: $scope.compose.message, authorization: "Bearer " + access_token };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    //alert(data);
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);
                    //alert(JSON.stringify(obj));
                    $scope.result.id = 1;
                    $scope.result.msg = 'Message Sent!';
                    $scope.result.css = 'successtoolbar';
                    $scope.newmessage = {};

                    $scope.getconversation(obj.conversation_id, 10);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
            self.setMainPage('Messages.html', { closeMenu: true }, 'Messages')
        }
        $scope.sendreply = function () {
            if (!$scope.newmessage.text || $scope.newmessage.text.length == 0) {
                $scope.replyempty = true;
                
                return;
            }
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var destinationarray = [];
            var data = { action: 'input_reply', conversation_id: $scope.CurrentConversation.obj[0].conversation_id, text: $scope.newmessage.text, authorization: "Bearer " + access_token };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    
                    $scope.getconversation($scope.CurrentConversation.obj[0].conversation_id);
                    $scope.result.id = 1;
                    $scope.result.msg = 'Message Sent!';
                    $scope.result.css = 'successtoolbar';
                    $scope.newmessage = {};

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
            self.setMainPage('Messages.html', { closeMenu: true }, 'Messages')
        }
        self.getsettings = function (navigate) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;

            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                crossDomain: true,
                data: {
                    action: 'output_settings',
                    authorization: "Bearer " + access_token
                },
                success: function (data) {
                    var json_obj = JSON.parse(data);;
                    //console.log(json_obj);
                    var profilesettings = json_obj.profile_settings;
                    var accountsettings = json_obj.account_settings;
                    var privacysettings =json_obj.privacy_settings;
                    self.userinfo.profilesettings = profilesettings;
                    angular.extend(self.userinfo.profilesettings, profilesettings);
                    // alert(JSON.stringify(self.userinfo.profilesettings));
                    self.userinfo.accountsettings = accountsettings;
                    angular.extend(self.userinfo.accountsettings, accountsettings);


                    $scope.AccountSettingsForm = { Current_password: '', New_password: '', Confirm_password: '' };
                   // $scope.PrivacyForm = { Public_audience: self.userinfo.accountsettings.privacy_settings };
                    $scope.privacysettings = privacysettings;//. {join_audience_settings:"anyone",messages_settings:"public",profile_visibility:"public"}
                    $scope.$apply();


                }
            });
            if (navigate)
                self.setMainPage('ProfileSettings.html', { closeMenu: true }, 'Edit Profile')
           
        }
        self.explore = function () {

        }

        self.savesettings = function () {
            var data = { action: 'save_account_settings', account_settings_updates: AccountSettingsForm };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);
                    

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
        }
        self.saveprofile = function () {
            $scope.isloading = true;
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            // alert(JSON.stringify(self.userinfo.profilesettings.links.splice()));
            //self.userinfo.profilesettings.Avatar_link = 'https://bracketdash-users.s3.amazonaws.com/1/profile-picture.jpg';
            var data = {
                action: 'save_profile_settings', profile_settings_updates: JSON.stringify(self.userinfo.profilesettings),
                authorization: "Bearer " + access_token
            };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    $scope.isloading = false;
                    $scope.getprofile(self.userinfo.Username, true, 1)
                    $scope.result.id = 1;
                    $scope.result.msg = 'Profile Updated Successfully';
                    $scope.result.css = 'successtoolbar';
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $scope.isloading = false;
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
        }
        self.saveprivacy = function () {
            var privacysettings = { join_audience_settings: self.userinfo.accountsettings.join_audience_settings }
            var data = { action: 'save_privacy_settings', privacy_settings_updates: AccountSettingsForm };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    // alert(data);
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);


                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
        }
        $scope.savecomment = function () {
            if (!$scope.newcomment.text ||$scope.newcomment.text.length == 0)
            {
                $scope.commentempty = true;
                return;
            }
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var data = { "action": "input_comment", "comment": $scope.newcomment.text, "activity_id": $scope.currentfeed.activity_id, authorization: "Bearer " + access_token };
            
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);
                    if (obj.status == 'success') {
                        self.getcomments($scope.currentfeed.activity_id);
                        $scope.newcomment = {};
                        $scope.result.id = 1;
                        $scope.result.msg = 'Comment Added Successfully';
                        $scope.result.css = 'successtoolbar';
                        $scope.commentdialog.hide();
                    } 

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
        }
        $scope.savereport = function (material, id) {

                var mod = material ? 'material' : undefined;
                ons.notification.confirm({
                    message: 'Are you sure you want to report this activity?',
                    modifier: mod,
                    callback: function (idx) {
                        switch (idx) {
                            case 0:

                                break;
                            case 1:
                                $scope.isloading = true;
                                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                                var data = { "action": "report_activity", "rationale": $scope.newreport.text, "activity_id": $scope.currentfeed.activity_id, authorization: "Bearer " + access_token };
                                $.ajax({
                                    url: "http://www.bracketdash.com/api/api.php",
                                    type: 'POST',
                                    data: data,
                                    crossDomain: true,
                                    success: function (data) {
                                        $scope.isloading = false;
                                        //console.log(data);
                                        var obj = JSON.parse(data);
                                        //console.log(obj);
                                        if (obj.status == 'success') {
                                            //self.getcomments($scope.currentfeed.activity_id);
                                            //doChange('#profile');
                                            
                                            $scope.newreport = {};
                                            $scope.result.id = 1;
                                            $scope.result.msg = 'Thanks, we have received your report';
                                            $scope.result.css = 'successtoolbar';
                                            $scope.commentdialog.hide();
                                            $scope.$apply();
                                        }

                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        $scope.isloading = false;
                                        $scope.newcomment = {};
                                        $scope.result.id = -1;
                                        $scope.result.msg = 'Report could not be added';
                                        $scope.result.css = 'errortoolbar';
                                        $scope.commentdialog.hide();
                                        $scope.$apply();
                                        alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                    }
                                });
                                return true;
                                break;
                        }
                    }
                });
            


        }
        $scope.reportvideo = function (id) {
            var material;
            var mod = material ? 'material' : undefined;
            ons.notification.confirm({
                message: 'Are you sure you want to report this video?',
                modifier: mod,
                callback: function (idx) {
                    switch (idx) {
                        case 0:

                            break;
                        case 1:
                            $scope.isloading = true;
                            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                            var data = { "action": "report_video", "activity_id": $scope.currentcon.activity_id, "video_id": $scope.currentcon.video_id, authorization: "Bearer " + access_token };
                            $.ajax({
                                url: "http://www.bracketdash.com/api/api.php",
                                type: 'POST',
                                data: data,
                                crossDomain: true,
                                success: function (data) {
                                    $scope.isloading = false;
                                    //console.log(data);
                                    var obj = JSON.parse(data);
                                    //console.log(obj);
                                    if (obj.status == 'success') {
                                        //self.getcomments($scope.currentfeed.activity_id);
                                        //doChange('#profile');
                                        
                                    $scope.dialogvidoptions.hide();
                                        $scope.newreport = {};
                                        $scope.result.id = 1;
                                        $scope.result.msg = 'Thanks, we have received your report';
                                        $scope.result.css = 'successtoolbar';
                                        $scope.$apply();
                                    }

                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    $scope.isloading = false;
                                    $scope.newcomment = {};
                                    $scope.result.id = -1;
                                    $scope.result.msg = 'Report could not be added';
                                    $scope.result.css = 'errortoolbar';
                                    $scope.commentdialog.hide();
                                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                }
                            });
                            return true;
                            break;
                    }
                }
            });



        }

        $scope.quitactivity = function (id) {
            var material;
            var mod = material ? 'material' : undefined;
            ons.notification.confirm({
                message: 'Are you sure you want to quit this activity?',
                modifier: mod,
                callback: function (idx) {
                    switch (idx) {
                        case 0:

                            break;
                        case 1:
                            $scope.isloading = true;
                            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                            var data = { "action": "quit_activity", "activity_id": id, authorization: "Bearer " + access_token };
                            $.ajax({
                                url: "http://www.bracketdash.com/api/api.php",
                                type: 'POST',
                                data: data,
                                crossDomain: true,
                                success: function (data) {
                                    $scope.isloading = false;
                                    //console.log(data);
                                    var obj = JSON.parse(data);
                                    //console.log(obj);
                                    if (obj.status == 'success') {
                                        $scope.result.id = 1;
                                        $scope.result.msg = 'You have quit this activity';
                                        $scope.result.css = 'successtoolbar';
                                        $scope.dialogvidoptions.hide();
                                        $scope.dialoginprogress.hide();
                                        try {
                                            var act = $filter('filter')($scope.feed.obj, { activity_id: id }, true)[0];
                                            var res = $filter('filter')(act.contestants_info.response, { contestant_username: self.userinfo.Username }, true)[0];
                                            var ind = act.contestants_info.response.indexOf(res);
                                            if (ind > -1)
                                                act.contestants_info.response.splice(ind, 1);
                                        } catch (e) { }
                                        try {
                                            var act = $filter('filter')($scope.feed.obj, { activity_id: id }, true)[0];
                                            var res = $filter('filter')(act.contestants_info, { contestant_username: self.userinfo.Username }, true)[0];
                                            res.quit_status = 'quit';
                                            //var ind = act.contestants_info.indexOf(res);
                                            //if (ind > -1)
                                            //    act.contestants_info.splice(ind, 1);
                                        } catch (e) { }

                                        
                                        $scope.$apply();

                                    }
                                    else
                                    {
                                        $scope.result.id = 2;
                                        $scope.result.msg = 'Sorry, something went wrong!';
                                        $scope.result.css = 'errortoolbar';
                                        $scope.commentdialog.hide();
                                        $scope.$apply();
                                    }

                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    $scope.isloading = false;
                                    $scope.newcomment = {};
                                    $scope.result.id = -1;
                                    $scope.result.msg = 'Sorry, something went wrong!';
                                    $scope.result.css = 'errortoolbar';
                                    $scope.commentdialog.hide();
                                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                }
                            });
                            return true;
                            break;
                    }
                }
            });



        }

        $scope.newlink = {name:null};
        $scope.addlink = function () {
            if (!self.userinfo.profilesettings.links)
            {
                self.userinfo.profilesettings.links = [$scope.newlink.name];
            }
            else { 
            var ind = self.userinfo.profilesettings.links.indexOf($scope.newlink.name);

            if (ind == -1)
                self.userinfo.profilesettings.links.push($scope.newlink.name);
            }
            $scope.newlink.name = null;
        }
        $scope.removelink = function (link) {
            var ind = self.userinfo.profilesettings.links.indexOf(link);

            if (ind > -1)
                self.userinfo.profilesettings.links.splice(ind, 1);
                
            $scope.newlink.name = null;
        }

        $scope.addusertomessage = function (evt,user) {
            var ind = $scope.compose.to.indexOf(user);
            //alert(ind);
                //var exist = $filter('filter')($scope.compose.to, { Username: user.Username }).length > 0;
            if (ind > -1) {
                $scope.compose.to.splice(ind, 1);
                $scope.compose.usernames.splice(ind, 1);
                $scope.usersearchresult.push(user);
            }
            else {
                var ind2 = $scope.compose.to.indexOf(user);
                $scope.usersearchresult.splice(ind2);
                $scope.compose.to.push(user);
                $scope.compose.usernames.push(user.Username);
            }
            //alert(JSON.stringify(user));

        }

        $scope.$watch('NewActivity.branchlength', function (value) {
            $scope.NewActivity.branches = [];
            for (var i = 1; i < $scope.NewActivity.branchlength / 2 + 1 ; i++) {
                var b = { branch_no: i, contestants: [{ Username: '', Fullname: '', Avatar_link: '' }, { Username: '', Fullname: '', Avatar_link: '' }] };
                $scope.NewActivity.branches.push(b);
            }
        });
        $scope.$watch('NewActivity.type', function (value) {
            $scope.searchuserquery = { q: '' };
            $scope.usersearchresult = [];
        });
        $scope.$watch('searchuserquery.q', function (value) {
            if ($scope.searchuserquery.q && $scope.searchuserquery.q.length > 0) {
                $scope.searchuser($scope.searchuserquery.q);
            }
        });
        $scope.$watch('searchquery.q', function (value) {
            if (value.length >= $scope.searchqueryminlen) {

                $scope.search(value);
            }
        });
        $scope.$watch('isloading', function (value) {
            if (value) {
                modloading.show();
            }
            else
                modloading.hide();
        });
        $scope.$watch('isplaying', function (value) {
            if ($scope.isplaying && $scope.isplaying.toString().length > 0) {
                
                if ($scope.isplaying == $scope.uploadedurl)
                {
                    $("#iframepreview").attr('src', 'http://www.bracketdash.com/video/video_player.php?link=' + $scope.isplaying);
                    $scope.dialogpreview.show();
                }
                else
                {
                    if ($scope.isplaying.length >0 && $scope.isplaying.indexOf('http') == -1)
                    {
                        $("#iframe").attr('src', 'http://www.bracketdash.com/video/mobile.player.html?id=' + $scope.isplaying);
                        $scope.videodialog.show();
                    }
                    else{
                    $("#iframe").attr('src', 'http://www.bracketdash.com/video/video_player.php?link=' + $scope.isplaying);
                    $scope.videodialog.show();
                    }
                }
                
                //var myVideo = document.getElementsByTagName('video')[0];
                //alert($scope.isplaying);
                //myVideo.src = $scope.isplaying;
                //myVideo.load();
                //myVideo.play();
                //$scope.$apply();
            }
            else {

            }
        });
        $scope.$watch('newuser.registeremail', function (value) {
            if(value !=null)$scope.validateemail();
        });
        $scope.$watch('changesettings.registeremail', function (value) {
            if (value != null && value!= self.userinfo.Email) $scope.validateemail2();
        });
        $scope.$watch('newuser.registerusername', function (value) {
            if (value != null) $scope.validateusername();
        });
        $scope.$watch('changesettings.registerusername', function (value) {
            if (value != null&& value!= self.userinfo.Username) $scope.validateusername2();
        });
        $scope.$watch('loginobj.loginemail', function (value) {
            if (value != null) { $scope.validateloginemail();  }
        });
        $scope.$watch('loginobj.loginpassword', function (value) {
            if (value != null) { $scope.validateloginpassword(); }
        });

        $scope.$watch('durationtype', function (value) {
            if (value == 'hour(s)') {
                $scope.selectdurationnumber = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'
                    , '20', '21', '22', '23', '24'];
                $scope.NewActivity.duration = $scope.durationnumber * 60 * 60;
            }
            if (value == 'day(s)') {
                $scope.selectdurationnumber = ['1', '2', '3', '4', '5', '6', '7'];
                $scope.NewActivity.duration = $scope.durationnumber * 60 * 60 * 24;
            }
            if (value == 'week(s)') {
                $scope.selectdurationnumber = ['1', '2', '3', '4'];
                $scope.NewActivity.duration = $scope.durationnumber * 60 * 60 * 24 * 7;
            }
        });

        $scope.$watch('durationnumber', function (value) {
            $scope.durationnumber = value;
            if ($scope.durationtype == 'hour(s)') {
                $scope.NewActivity.duration = $scope.durationnumber * 60 *60;
            }
            if ($scope.durationtype == 'day(s)') {
                $scope.NewActivity.duration = $scope.durationnumber * 60 * 60 *24;
            }
            if ($scope.durationtype == 'week(s)') {
                $scope.NewActivity.duration = $scope.durationnumber * 60 * 60 * 24 * 7;
            }
        });

        $scope.$watch('result.id', function (value) {
            if (value && value != 0)
            {
                setTimeout(function () {  $scope.confirmresult() }, 10000);
            }
        });

        self.closevideo = function ($event) {
            $scope.isplaying = '';
            $("#iframe").attr('src', '');
            //$scope.videodialog.hide();

        }
        ons.ready(function () {
            self.checklogin();
            if (self.isloggedin)
                self.getmyprofile(false);
            //self.setMainPage('NewActivity.html', {}, 'New Activity');
            self.getfeed('explore', 'Explore');

            ons.createPopover('popover.html').then(function (popover) {
                $scope.popover = popover;
            });
            ons.createDialog('dialogcategory.html').then(function (dialogcategory) {
                $scope.dialogcategory = dialogcategory;
            });
            ons.createPopover('popovervisibility.html').then(function (popovervisibility) {
                $scope.popovervisibility = popovervisibility;
            });
            ons.createDialog('dialogvisibility.html').then(function (dialogvisibility) {
                $scope.dialogvisibility = dialogvisibility;
            });
            ons.createDialog('dialoguserselect.html').then(function (dialoguserselect) {
                $scope.dialoguserselect = dialoguserselect;
            });
            ons.createPopover('popoverbranchlength.html').then(function (popoverbranchlength) {
                $scope.popoverbranchlength = popoverbranchlength;
            });
            ons.createDialog('dialogbranchlength.html').then(function (dialogbranchlength) {
                $scope.dialogbranchlength = dialogbranchlength;
            });
            ons.createPopover('popoveruserlist.html').then(function (popoveruserlist) {
                $scope.popoveruserlist = popoveruserlist;
            });
            ons.createDialog('dialoguserreplace.html').then(function (dialoguserreplace) {
                $scope.dialoguserreplace = dialoguserreplace;
            });

            
            ons.createDialog('dialogcomment.html').then(function (dialog) {
                $scope.commentdialog = dialog;
            });
            ons.createDialog('dialog.html').then(function (dialog) {
                $scope.videodialog = dialog;

            });
            ons.createDialog('dialogpreview.html').then(function (dialog) {
                $scope.dialogpreview = dialog;

            });
            ons.createDialog('invitationdialog.html').then(function (dialog) {
                $scope.invitationdialog = dialog;

            });
            ons.createDialog('dialogaudiencerequests.html').then(function (dialogaudiencerequests) {
                $scope.dialogaudiencerequests = dialogaudiencerequests;

            });

            
            ons.createPopover('popoverfileselect.html').then(function (popoverfileselect) {
                $scope.popoverfileselect = popoverfileselect;
            });
            ons.createDialog('dialogprofilepic.html').then(function (dialogprofilepic) {
                $scope.dialogprofilepic = dialogprofilepic;
            });
            ons.createDialog('dialogpassword.html').then(function (dialogpassword) {
                $scope.dialogpassword = dialogpassword;
            });
            ons.createDialog('dialoglogintocontinue.html').then(function (dialoglogintocontinue) {
                $scope.dialoglogintocontinue = dialoglogintocontinue;
            });
            ons.createDialog('dialogduration.html').then(function (dialogduration) {
                $scope.dialogduration = dialogduration;
            });
            ons.createDialog('dialogusertomessage.html').then(function (dialogusertomessage) {
                $scope.dialogusertomessage = dialogusertomessage;
            });

            ons.createDialog('dialogvidoptions.html').then(function (dialogvidoptions) {
                $scope.dialogvidoptions = dialogvidoptions;
            });
            ons.createDialog('dialogvidoptionsinprogress.html').then(function (dialogvidoptionsinprogress) {
                $scope.dialogvidoptionsinprogress = dialogvidoptionsinprogress;
            });

            ons.createDialog('dialoginprogress.html').then(function (dialoginprogress) {
                $scope.dialoginprogress = dialoginprogress;
            });

            ons.createDialog('dialogaddlink.html').then(function (dialogaddlink) {
                $scope.dialogaddlink = dialogaddlink;
            });

            ons.createDialog('dialogterms.html').then(function (dialogterms) {
                $scope.dialogterms = dialogterms;
            });

            if (!ons.platform.isWebView())
            {
                $scope.isbrowser=true;
            }
            if (device.platform.toLowerCase() === 'android' && device.version.indexOf('4.4') === 0
                          ) {
                $scope.version44 = true;
            }
            //$scope.version44 = true;
            //alert(device.platform.toLowerCase());
            if (device.platform.toLowerCase() === 'ios') {
                
                $scope.ios = true;
                
            }//alert($scope.ios);
            //document.addEventListener("backbutton", onBackKeyDown, false);
            ////alert($scope.version44);
            //function onBackKeyDown() {
            //    // Handle the back button
            //    alert("Backbutton is pressed!");
                
            //    var element = document.querySelector(".navigator-container");
            //    var scope = angular.element(element).scope();
            //    scope.popPage();
            //    return false;
            //}
            //else
              //  alert(device.version.indexOf('4.2'));

            ons.setDefaultDeviceBackButtonListener(function () {
                try {
                    var exist = $filter('filter')($scope.history, { page: $scope.CurrentPageAddress },true)[0];
                    if (exist) {
                        var ind = $scope.history.indexOf(exist);
                        if (ind > 0) {
                            var hist = $scope.history[ind - 1];
                            self.setMainPage(hist.page, hist.args, hist.title, true);
                        } else {
                            if (self.CurrentPage == 'Explore') {

                                $scope.exitapp();
                                return;
                            }
                        }
                        return;
                    }
                    //alert($scope.CurrentPageAddress);
                    //alert(JSON.stringify($scope.history));
                    
                } catch (e) { alert(e);}
                //self.goback(2);
            })
            navigator.splashscreen.hide();
               
            

        
        });
        $scope.cats = ['Entertainment', 'Sports', 'Humor', 'Music', 'Poetry', 'Arts', 'Other'];
        $scope.visibilityoptions = ['Public', 'Audience'];
        $scope.contestants = [];
        //
        
        self.overlaylement = function (elem, target, top, right, bottom, left, elemwidth, elemheight, anim) {
            var element = $('#' + elem);
            if (elemwidth != null && elemwidth > 0)
                element.width(elemwidth);
            if (elemheight != null && elemheight > 0)
                element.height(elemheight);
            var target = $('#' + target);

            var offset = target.offset();
            var height = target.css('height');
            var width = target.css('width');
            var elemtop = (target.height() / 2) + 'px';
            element.css({
                position: 'absolute',
                'z-index': 10001,
                top: elemtop
            });
            if (right != null) {
                var elemright = target.width() + right + 10;
                element.css({
                    right: elemright + 'px'
                });
            }

            if (left != null) {
                var elemleft = target.width() + left + 10;
                element.css({
                    right: elemright + 'px'
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
        self.formatnewactivity = function () {
            //bracket "{"title":"TITLE","type":"battle","description":"DFESC","category":"entertainment","visibility":"public","duration":18000,"contestants":["mosta2"]}"
            var formatted = $scope.NewActivity;
            delete formatted.branchlength;
            formatted.setup = formatted.type;
            if (formatted.type == 'bracket') {
                for (var i = 0; i < formatted.branches.length; i++) {
                    delete formatted.branches[i].$$hashKey;
                    for (var j = 0; j < formatted.branches[i].contestants.length; j++) {
                        var usrname = formatted.branches[i].contestants[j].Username;
                        formatted.branches[i].contestants[j] = { username: usrname };
                    }
                }
                if (formatted.type == 'bracket') {
                    delete formatted.contestants;
                }
            }
            if (formatted.type == 'battle') {
                delete formatted.branches;
                formatted.round ='';
                formatted.setup = '';
                formatted.status = '';
                for (var i = 0; i < formatted.contestants.length; i++) {
                    var username = formatted.contestants[i].Username;
                    formatted.contestants[i] = username;
                }
            }
            return formatted;

        }
        self.likevideo = function (activityid, videoid,mode) {
            if (!self.isloggedin)
            {
                $scope.setlogincallback('likevideo', activityid, videoid);
                $scope.requestlogin();
                return;
            }
            var act = null;
            if (self.CurrentPage == "BioContent" || self.CurrentPage == "Activities" || self.CurrentPage == "Activity Log")
            {
                act = $filter('filter')($scope.viewuserinfo.feedinprogress.obj, { activity_id: activityid }, true)[0];
            }
            if (self.CurrentPage == "Single Activity") {
                act = $scope.showsingleactivity;
            }
            if (self.CurrentPage == "Explore" || self.CurrentPage == "Panel") {
                act = $filter('filter')($scope.feed.obj, { activity_id: activityid }, true)[0];
            }
           // var act = $filter('filter')($scope.feed.obj, { activity_id: activityid }, true)[0];
            if (act.activity_status == 'expired')
            {
                $scope.result.id = -1;
                $scope.result.css = 'errortoolbar';
                $scope.result.msg = 'Sorry, the activity has already expired!'
                return;
            }
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'post',
                data: {
                    action: 'like', activity_id:activityid ,
                    video_id: videoid, authorization: "Bearer " + access_token
                },
                crossDomain: true,
                success: function (data) {
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);
                    //alert(mode);
                    //alert(videoid);
                    setTimeout(
                    $scope.$apply(function () {
                        if (mode && mode == "challenge")
                            var con = act.contestants_info.challenge;


                        if (mode && mode == "response") {
                            var con = $filter('filter')(act.contestants_info.response, { video_id: videoid }, true)[0];

                        }
                        //alert(JSON.stringify(act.contestants_info));
                        if (!mode)
                            var con = $filter('filter')(act.contestants_info, { video_id: videoid }, true)[0];
                        con.likes = obj.count;
                        if (con.like_status == 'liked')
                            con.like_status = 'unliked';
                        else
                            con.like_status = 'liked';
               
                    }), 1000);
                   // $scope.$apply();
                }
            });
            return true;
        }
        self.initupload = function () {
            $scope.isuploading = 1;
            $scope.file = '';

            $scope.commentdialog.hide();

            //var tli = new Transloadit();
            var file ;//= $('#inputupload').get(0).files[0];
            if ($scope.uploadcreateactivity) {file= $('#inputupload').get(0).files[0]; }
            if ($scope.uploadcreateresponse) { file= $('#inputuploadresponse').get(0).files[0]; }
            if ($scope.uploadcreateprogress) { file = $('#inputuploadprogress').get(0).files[0]; }
            //transloadit.uploadFile(file);
            try{
                cordova.plugins.backgroundMode.setDefaults({title:'BracketDash is uploading your file.', text: 'Uploading...' });
                cordova.plugins.backgroundMode.enable();
            }catch(e){}
            Transloadit.upload(file, {
                params: {
                    auth: { key: "7e36b0800fec11e5b74aa7b807288d6d" },
                    template_id: "7a0d23c0119c11e59b7c67e0d9c6ade5",
                            steps: {}
                        
                    // template_id: 'my-template-id'
                },

                signature: function (callback) {
                    // ideally you would be generating this on the fly somewhere
                    callback('d1e6d2ee0d1abedbf74481e642421d6d4fec5b64');
                },

                progress: function (loaded, total) {
                    //alert(loaded + 'bytes loaded');
                    $scope.uploadprogress = parseInt(loaded / total * 100) +' %' ; //();

                    try {
                        $scope.$apply();
                    } catch (e) { }
                    //console.log(total + ' bytes total');
                },

                processing: function () {
                   // alert(JSON.stringify(data));
                    //console.log('done uploading, started processing');
                    //$scope.fileuploadresult = 'File uploaded successfully, currently processing';
                    //try{
                    //    $scope.$apply();}catch(e){};
                },

                uploaded: function (assemblyJson) {
                    try {
                        try{
                            cordova.plugins.backgroundMode.disable();
                        }catch(e){}
                        var control = $("#file_input");
                        control.replaceWith(control = control.clone(true));
                        $scope.uploadprogress = '';
                        //$scope.isuploading = 2;
                        $scope.fileuploadresult = 'File uploaded successfully';

                        //console.log(assemblyJson.results.mp4[0].url);
                        $scope.uploadedurl = assemblyJson.results.mp4[0].ssl_url;
                        if ($scope.uploadcreateactivity) {
                            $scope.NewActivity.video_links.webm = assemblyJson.results.webm[0].ssl_url;
                            $scope.NewActivity.video_links.ogg = assemblyJson.results.ogg[0].ssl_url;
                            $scope.NewActivity.video_links.mp4 = $scope.uploadedurl;
                            $scope.NewActivity.video_links.phone = assemblyJson.results.phone[0].ssl_url;
                            $scope.NewActivity.video_links.tablet = assemblyJson.results.tablet[0].ssl_url;
                            $scope.NewActivity.video_links.thumbnail = assemblyJson.results.thumbnail[0].ssl_url;
                            $scope.NewActivity.video_links.tablet = assemblyJson.results.tablet[0].ssl_url;
                        }
                        if ($scope.uploadcreateresponse) {
                            $scope.NewResponse.video_links_array.webm = assemblyJson.results.webm[0].ssl_url;
                            $scope.NewResponse.video_links_array.ogg = assemblyJson.results.ogg[0].ssl_url;
                            $scope.NewResponse.video_links_array.mp4 = $scope.uploadedurl;
                            $scope.NewResponse.video_links_array.phone = assemblyJson.results.phone[0].ssl_url;
                            $scope.NewResponse.video_links_array.tablet = assemblyJson.results.tablet[0].ssl_url;
                            $scope.NewResponse.video_links_array.thumbnail = assemblyJson.results.thumbnail[0].ssl_url;
                            $scope.NewResponse.video_links_array.tablet = assemblyJson.results.tablet[0].ssl_url;
                        }

                        if ($scope.uploadcreateprogress) {
                            $scope.NewProgress.video_links_array.webm = assemblyJson.results.webm[0].ssl_url;
                            $scope.NewProgress.video_links_array.ogg = assemblyJson.results.ogg[0].ssl_url;
                            $scope.NewProgress.video_links_array.mp4 = $scope.uploadedurl;
                            $scope.NewProgress.video_links_array.phone = assemblyJson.results.phone[0].ssl_url;
                            $scope.NewProgress.video_links_array.tablet = assemblyJson.results.tablet[0].ssl_url;
                            $scope.NewProgress.video_links_array.thumbnail = assemblyJson.results.thumbnail[0].ssl_url;
                            $scope.NewProgress.video_links_array.tablet = assemblyJson.results.tablet[0].ssl_url;
                        }

                        $scope.uploadedthumb = assemblyJson.results.thumbnail[0].ssl_url;
                        $scope.isuploading = 0;

                        $scope.playvideo(assemblyJson.results.mp4[0].ssl_url);
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                        //if ($scope.uploadcreateactivity) {
                        //    $scope.uploadcreateactivity = false;
                        //    self.addactivity();
                        //}
                        //console.log(assemblyJson);
                    } catch (e) { alert(e);}
                },

                error: function (error) {
                    
                    //alert(JSON.stringify(error));
                     $scope.fileuploadresult = 'File Failed to upload';
                     $scope.isuploading = 0;
                     $scope.result.id = -1;
                     $scope.result.msg = 'File failed to upload or rejected!';
                     $scope.result.css = 'errortoolbar';
                    try {
                        $scope.$apply();
                    } catch (e) { }
                }
            });
            
            //var options = {
            //    params:{auth: { key: "622e18e0d81111e5b7ff9bc4624f6488" },
            //        steps: {
            //            resize_to_125: { robot: "/image/resize", use: ":original", width: 125, height: 125 },
            //            resize_to_75: {
            //                robot: "/image/resize",
            //                use: "resize_to_125",
            //                width: 75,
            //                height: 75,
            //                // We also add a sepia effect here just for fun.
            //                // The /image/resize robot has a ton of available parameters.
            //                sepia: 80
            //            }
            //        }},
            //    uploaded: function(){alert('done');}
                

            //}
            //Transloadit.upload(file, options);

            
            
            //var transloadit = new TransloaditXhr({
            //    params: {

            //        auth: { key: "622e18e0d81111e5b7ff9bc4624f6488" },
            //        steps: {
            //            resize_to_125: {
            //                robot: "/image/resize",
            //                use: ":original",
            //                width: 125,
            //                height: 125
            //            },
            //            // The second Step resizes the results further to 75x75 pixels.
            //            // Notice how we "use" the output files of the "resize_to_125"
            //            // step as our input here. We could use all kinds of Steps with
            //            // various robots that "use" each other, making this perfect for
            //            // any workflow.
            //            resize_to_75: {
            //                robot: "/image/resize",
            //                use: "resize_to_125",
            //                width: 75,
            //                height: 75,
            //                // We also add a sepia effect here just for fun.
            //                // The /image/resize robot has a ton of available parameters.
            //                sepia: 80
            //            }
            //        }
            //    },

            //    successCb: function (results) {
            //        //alert(JSON.stringify(results));
            //        $scope.isuploading = 2;
            //        $scope.fileuploadresult = 'File uploaded successfully';
            //        if ($scope.uploadcreateactivity) {
            //            $scope.uploadcreateactivity = false;
            //            self.addactivity();
            //        }
            //        $scope.$apply();

            //        //alert("Worked");
            //        //alert(JSON.stringify(results));
            //    },

            //    errorCb: function (err) {

            //        $scope.isuploading = -1;
            //        $scope.$apply();

            //        alert('err');
            //        alert(JSON.stringify(err));
            //    }
            //});
            ////alert(JSON.stringify($('#file_input').val()));//.get(0).files[0]));

            //var file = $('#file_input').get(0).files[0];
            //transloadit.uploadFile(file);


            //var win = function (r) {
            //    console.log("Code = " + r.responseCode);
            //    console.log("Response = " + r.response);
            //    console.log("Sent = " + r.bytesSent);
            //}

            //var fail = function (error) {
            //    alert("An error has occurred: Code = " + error.code);
            //    console.log("upload error source " + error.source);
            //    console.log("upload error target " + error.target);
            //}

            //var options = new FileUploadOptions();
            //options.fileKey = "file";
            //options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
            //options.mimeType = "image/jpg";

            //var params = {};
            //params.value1 = "test";
            //params.value2 = "param";

            //options.params = params;

            //var ft = new FileTransfer();
            //ft.upload(fileURL, encodeURI("http://some.server.com/upload.php"), win, fail, options);



            //$('#file_input').transloadit({
            //    wait: true,
            //    triggerUploadOnFileSelection: true,
            //    autoSubmit: false,
            //    params: {
            //        auth: { key: "622e18e0d81111e5b7ff9bc4624f6488" },
            //        steps: {
            //            resize_to_125: {
            //                robot: "/image/resize",
            //                use: ":original",
            //                width: 125,
            //                height: 125
            //            },
            //            resize_to_75: {
            //                robot: "/image/resize",
            //                use: "resize_to_125",
            //                width: 75,
            //                height: 75,
            //                sepia: 80
            //            }
            //        }
            //    },
            //    onSuccess(assembly) {
            //        console.log(assembly);
            //        var url = assembly.results.mp4[0].url;
            //        var img = assembly.results.resized_thumbs[0].url;
            //        console.log(url);
            //        console.log(img);
            //        var thumb_img = new Image();
            //        thumb_img.src = img;
            //        thumb_img.width = 120;
            //        thumb_img.height = 70;
            //        //$('.response-thumbnail').html(thumb_img);
            //    }
            //});

        }
        self.uploadcomplete = function () { alert(''); }
        $scope.addresponse = function (activityid,mode) {
            if (mode != 'finish' && $scope.isuploading == 0) {
                $scope.uploadcreateresponse = true;
                $scope.uploadactivityid = activityid;
                self.initupload();
                return;
            }
            if (!$scope.validvideo)
            {
                return;
            }
                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
                //console.log(JSON.stringify(self.formatnewactivity()));
                //console.log(access_token);
                data = { action: 'input_open_challenge_response', activity_id: activityid, video_links_array: JSON.stringify($scope.NewResponse.video_links_array), authorization: "Bearer " + access_token };
                $.ajax({
                    url: "http://www.bracketdash.com/api/api.php",
                    type: 'post',
                    data: data,
                    crossDomain: true,
                    success: function (data) {
                        //console.log(data);
                        var obj = JSON.parse(data);
                        //console.log(obj);

                        if (obj.status == 'success') {
                            if (self.CurrentPage == 'Explore') {
                                var responsefeed = $filter('filter')($scope.feed.obj, { activity_id: activityid }, true)[0];
                                if (!responsefeed.contestants_info.response)
                                    responsefeed.contestants_info.response = [];
                                responsefeed.contestants_info.response.push(obj.obj);
                            }
                            else {
                                var responsefeed = $filter('filter')($scope.viewuserinfo.feedinprogress.obj, { activity_id: activityid }, true)[0];
                                if (!responsefeed.contestants_info.response)
                                    responsefeed.contestants_info.response = [];
                                responsefeed.contestants_info.response.push(obj.obj);
                            }
                            $scope.NewResponse = {
                                activity_id: null, video_links_array: { "webm": null, "ogg": null, "mp4": null, "phone": null, "tablet": null }
                            };
                            $scope.result.id = 1;
                            $scope.result.msg = 'Response Added Successfuly';
                            $scope.result.css = 'successtoolbar';
                        }
                        else {
                            $scope.result.id = -1;
                            $scope.result.msg = 'Could not add Response';
                            $scope.result.css = 'errortoolbar';
                        }
                        $scope.$apply();
                    },
                    error: function (data) { alert(JSON.stringify(data)); }
                });
        }
        $scope.userresponded = function (cons) {
            if (!cons.response)
                return false;
            else{
                return $filter('filter')(cons.response, { contestant_username: self.userinfo.Username }, true).length > 0 ;
            }
        }
        $scope.addprogress = function (activityid) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            //console.log(JSON.stringify(self.formatnewactivity()));
            data = {
                action: 'input_activity_in_progress_video', activity_id: $scope.uploadactivityid,
                video_links_array: JSON.stringify($scope.NewProgress.video_links_array), authorization: "Bearer " + access_token
            };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'post',
                data: data,
                crossDomain: true,
                success: function (data) {
                    //console.log(data);
                    var obj = JSON.parse(data);
                    //console.log(obj);
                    if (obj.status == 'success') {

                        $scope.NewProgress = {
                            activity_id: null, video_links_array: { "webm": null, "ogg": null, "mp4": null, "phone": null, "tablet": null }
                        };
                        $scope.result.id = 1;
                        $scope.result.msg = 'Video Added Successfuly';
                        $scope.result.css = 'successtoolbar';
                        self.getactivityinprogress(self.userinfo.Username, true, 'Activities in progress');
                    }
                    else {
                        $scope.result.id = -1;
                        $scope.result.msg = 'Could not add Video';
                        $scope.result.css = 'errortoolbar';
                    }
                    $scope.$apply();
                },
                error: function (data) { alert(JSON.stringify(data)); }
            });
        }
        $scope.confirmupload = function (mode) {
            $scope.isuploading = 0;
            $scope.file = null;
            
            if (mode == 'finish')
            {
                $scope.dialogpreview.hide();
                if ($scope.uploadcreateactivity) {
                    $scope.uploadcreateactivity = false;
                    self.addactivity('finish');
                }
                if ($scope.uploadcreateresponse) {
                    $scope.uploadcreateresponse = false;
                    $scope.addresponse($scope.uploadactivityid, 'finish');
                    $scope.uploadactivityid = null;
                }

                if($scope.uploadcreateprogress)
                {
                    $scope.uploadcreateprogress = false;
                    $scope.addprogress();
                }
            }
            if (mode == 'cancel')
            {
                $scope.dialogpreview.hide();
            }
            if (mode == 'delete')
            {
                var material;
                var mod = material ? 'material' : undefined;
                ons.notification.confirm({
                    message: 'Are you sure you want to delete this video?',
                    modifier: mod,
                    callback: function (idx) {
                        switch (idx) {
                            case 0:

                                break;
                            case 1:
                                var vidarray;
                                if ($scope.uploadcreateactivity) {
                                    vidarray = $scope.NewActivity.video_links;
                                }
                                if ($scope.uploadcreateresponse) {
                                    vidarray = $scope.NewResponse.video_links_array;
                                }

                                if ($scope.uploadcreateprogress)
                                {
                                    vidarray = $scope.NewProgress.video_links_array;
                                }
                                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                                var data = { "action": "delete_preview_video", "video_links_array": vidarray, authorization: "Bearer " + access_token };

                                $.ajax({
                                    url: "http://www.bracketdash.com/api/api.php",
                                    type: 'POST',
                                    data: data,
                                    crossDomain: true,
                                    success: function (data) {
                                        //console.log(data);
                                        var obj = JSON.parse(data);
                                        //console.log(obj);
                                        if (obj.status == 'success') {
                                            $scope.result = { id: 1, msg: 'Video has been deleted ', css: 'successtoolbar' };
                                            //self.hidecomments(id);
                                            $scope.dialogpreview.hide();
                                            self.getactivityinprogress(self.userinfo.Username, true, 'Activities in progress');
                                        }
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                    }
                                });
                                return true;
                                break;
                        }
                    }
                });
                //alert('cancelled');
            }
        }
        $scope.confirmresult = function () {
            $scope.result.id = 0;
            if (!$scope.$$phase) {

                $scope.$apply();
            }
        }
        $scope.file = '';
        $scope.uploadbutton = true;
        $scope.uploadcreateactivity = false;
        $scope.uploadresponse = false;
        $scope.newvidvalid = true;
        $scope.setFiles = function (element, auto, uplaodbtn,mode,id) {
            try {
                $scope.file = $(element).val().substr($(element).val().lastIndexOf("\\") + 1);
                //$scope.$apply();
                $scope.uploadbutton = uplaodbtn;
                //if (auto)
                //{ $scope.initupload();}
                $scope.validvideo = true;
                if (mode == 'response') {
                    //$scope.validatevideo(element);

                }
                if (mode == 'activity') {
                    // $scope.validatevideo(element);
                }
                if (mode == 'progress') {
                    // $scope.validatevideo(element, true);

                    $scope.uploadcreateprogress = true;
                    self.initupload();

                }

                $scope.$apply();
            } catch (e) { alert(e)}
        };
        $scope.validatevideo = function (element, progress) {
            var URL = window.URL || window.webkitURL
            var file = element.files[0];
            var videoNode = document.querySelector('#vid');
            $scope.isloading = true;

            var fileURL = URL.createObjectURL(file);
            videoNode.src = fileURL;
            setTimeout(function () {
                $scope.isloading = false;
                if (!videoNode.duration) {
                    ons.notification.alert({
                        message: 'Please select another video, the video seems to be not supported!'
                    });
                    $scope.validvideo = false;
                    $scope.file = null;
                }
                else {
                    if (videoNode.duration / 60 > 5) {
                        $scope.validvideo = false;
                        ons.notification.alert({
                            message: 'Please select a video with maximum 5 minutes length!'
                        });
                        $scope.file = null;
                        videoNode.src = '';
                    }
                    else {
                        $scope.validvideo = true;
                    }
                }
                if (!$scope.validvideo) {
                    $scope.file = null;
                }
                $scope.$apply();
                if (progress && $scope.validvideo)
                {
                    $scope.uploadcreateprogress = true;
                    self.initupload();
                }
            }, 2000);
        }
        $scope.checkduration = function () {
            return;
            var videoNode = document.querySelector('#vid');
            
            if (videoNode.duration / 60 > 5) {
                $scope.validvideo = false;
                ons.notification.alert({
                    message: 'Please select a video with maximum 5 minutes length!'
                });
                $scope.file = null;
                videoNode.src = '';
            }
            else {
                $scope.validvideo = true;
            }
            $scope.$apply();

        }
        $scope.videofailed = function () {
            var videoNode = document.querySelector('#vid');
            
            setTimeout(function () {
                if (!videoNode.duration) {
                   
                }
                else { alert('OK');}
            }, 2000);
        }
        $scope.selectfile = function (mode,id) {
            try {
                if ($scope.isuploading == 1) {
                    ons.notification.alert({
                        message: 'There is an upload in progress please try again later'
                    });
                    return;
                }
                if (mode == 'activity')
                {
                    self.validateactivity(true);
                    $scope.uploadactivityid = id;
                    if (!$scope.newactivityvalidation.status) {
                        try { $scope.$apply(); } catch (e) { }
                        return;
                    }
                    $scope.uploadcreateactivity = true;
                }
                if (mode == 'response') {
                    $scope.uploadcreateresponse = true;
                    $scope.uploadactivityid = id;
                }
                if (mode == 'progress') {
                    $scope.uploadcreateprogress = true;
                    $scope.uploadactivityid = id;
                }
                var fc = new $filechooser();
                fc.open({},$scope.fileopensuccess, $scope.fileopenfail);
            } catch (e) { alert('Error');}
        }
        $scope.getxhr = function createCORSRequest(method, url) {
            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr) {

                // Check if the XMLHttpRequest object has a "withCredentials" property.
                // "withCredentials" only exists on XMLHTTPRequest2 objects.
                xhr.open(method, url, true);

            } else if (typeof XDomainRequest != "undefined") {

                // Otherwise, check if XDomainRequest.
                // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
                xhr = new XDomainRequest();
                xhr.open(method, url);

            } else {

                // Otherwise, CORS is not supported by the browser.
                xhr = null;

            }
            return xhr;
        }
        $scope.getimagebase64 = function convertFileToDataURLviaFileReader(url, callback) {
            try {  

            } catch (e) { alert(e); }
        }
        $scope.cropper = function (src) {
            $('#image').attr("src", src);
            $('#image').cropper({
                aspectRatio: 16 / 9,
                built: function () {
                    // Strict mode: set crop box data first
                    //$image.cropper('setCropBoxData', cropBoxData);
                    $('#image').cropper('getCroppedCanvas', $scope.getCroppedCanvas);
                }
            });
        }
        $scope.selectprofilepic = function () {
            try {
                var fc = new $filechooser();
                fc.open({}, $scope.profilepicselected, $scope.profilepicfailed);
            } catch (e) { alert('1781>>' + e); }
        }
        $scope.checkfileprocessed = function (assemblyID) {
            $.ajax({
                url: "https://api2.transloadit.com/assemblies/" + assemblyID,
                type: 'Get',
                crossDomain: true,
                success: function (data) {
                    try {
                      //  var obj = JSON.parse(data);
                        //try { alert("15" + JSON.stringify(data)); } catch (e) { }
                        //try { alert("15" + JSON.stringify(data.ok)); } catch (e) { }
                        //alert(data.ok);
                        if (data.error && data.error.length > 0)
                        {
                            $scope.isuploading = -1;
                            try {
                                $scope.$apply();
                            } catch (e) { }
                            return;
                        }
                        if (data.ok != "ASSEMBLY_COMPLETED") {
                            //alert('not ready.. processing');
                            if (data.ok == "ASSEMBLY_EXECUTING") {
                                //alert('not ready.. processing');
                                $scope.fileuploadresult = 'File uploaded, processing in progress';
                            }
                            setTimeout(function () { $scope.checkfileprocessed(assemblyID) }, 5000);
                        }
                        else {
                        //alert('DONE' + assemblyID);
                        $scope.fileuploadresult = 'File uploaded successfully';
                        //  alert(data.results.mp4[0].url);
                        //var control = $("#file_input");
                        //control.replaceWith(control = control.clone(true));
                        $scope.uploadedurl = data.results.mp4[0].ssl_url;
                        if ($scope.uploadcreateactivity) {
                            $scope.NewActivity.video_links.webm = data.results.webm[0].ssl_url;
                            $scope.NewActivity.video_links.ogg = data.results.ogg[0].ssl_url;
                            $scope.NewActivity.video_links.mp4 = $scope.uploadedurl;
                            $scope.NewActivity.video_links.phone = data.results.phone[0].ssl_url;
                            $scope.NewActivity.video_links.tablet = data.results.tablet[0].ssl_url;
                            try { $scope.NewActivity.video_links.thumbnail = data.results.thumbnail[0].ssl_url; } catch (e) { }
                        }
                        if ($scope.uploadcreateresponse) {
                            $scope.NewResponse.video_links_array.webm = data.results.webm[0].ssl_url;
                            $scope.NewResponse.video_links_array.ogg = data.results.ogg[0].ssl_url;
                            $scope.NewResponse.video_links_array.mp4 = $scope.uploadedurl;
                            $scope.NewResponse.video_links_array.phone = data.results.phone[0].ssl_url;
                            $scope.NewResponse.video_links_array.tablet = data.results.tablet[0].ssl_url;
                            try { $scope.NewResponse.video_links_array.thumbnail = data.results.thumbnail[0].ssl_url; } catch (e) { }
                        }
                        if ($scope.uploadcreateprogress) {
                            $scope.NewProgress.video_links_array.webm = data.results.webm[0].ssl_url;
                            $scope.NewProgress.video_links_array.ogg = data.results.ogg[0].ssl_url;
                            $scope.NewProgress.video_links_array.mp4 = $scope.uploadedurl;
                            $scope.NewProgress.video_links_array.phone = data.results.phone[0].ssl_url;
                            $scope.NewProgress.video_links_array.tablet = data.results.tablet[0].ssl_url;
                            $scope.NewProgress.video_links_array.thumbnail = data.results.thumbnail[0].ssl_url;
                            $scope.NewProgress.video_links_array.tablet = data.results.tablet[0].ssl_url;
                        }
                        try { $scope.uploadedthumb = data.results.thumbnail[0].ssl_url; } catch (e) { }
                        //alert('values are set');

                        $scope.isuploading = 0;

                        $scope.playvideo(data.results.mp4[0].ssl_url);
                        try {
                            $scope.$apply();
                        } catch (e) { }
                    }
                    } catch (e) { alert(e);
                    }
                    
                },
                error: function (data) {
                    $scope.isloading = false;
                    $scope.$apply();
                     alert(jSON.stringify(data));
                }
            });

           
        }
        $scope.fileopensuccess = function (data) {
            try {
                var filepath = data.filepath;
                var videoNode = document.querySelector('#vid');
                //$scope.isloading = true;
                //window.plugins.Base64.encodeFile(data.filepath, function (base64) {
                //    alert(base64);
                //    videoNode.src = "data:video/mp4;base64," + base64;
                //    alert(videoNode.src);
                //});
                

                setTimeout(function () {

                    $scope.isloading = false;

                function win(assemblyJson) {
                    try {
                        try {
                            $scope.uploadprogress = '';
                            try{$scope.$apply();}catch(e){}
                            var obj = JSON.parse(assemblyJson.response);
                            $scope.checkfileprocessed(obj.assembly_id);
                            return;
                        } catch (e) {
                            alert(e);
                        }
                      }catch(e){alert(e);}
                }
                function fail(error) {
                    $scope.fileuploadresult = 'File Failed to upload';
                    $scope.isuploading = 0;
                    $scope.result.id = -1;
                    $scope.result.msg = 'File failed to upload or rejected!';
                    $scope.result.css = 'errortoolbar';
                    try { $scope.$apply(); } catch (e) { }
                    //alert('File Failed to upload' + error);
                }
                var uri = encodeURI("https://api2-eu-west-1.transloadit.com/assemblies");
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = filepath.substr(filepath.lastIndexOf('/') + 1);
                var extension = filepath.substr(filepath.lastIndexOf('.') + 1);

                var params = {};
                //params.params = '[signed assembly goes here]';

                params.params = new Object();
                params.params.auth = new Object();

                params.params.auth.key = "7e36b0800fec11e5b74aa7b807288d6d";
                params.params.template_id = "7a0d23c0119c11e59b7c67e0d9c6ade5";
                params.params.steps = new Object();
                params.params.steps = {};
                options.params = params; 


                //alert(JSON.stringify(options.params));
                var ft = new FileTransfer();
                ft.onprogress = function (progressEvent) {
                    if (progressEvent.lengthComputable) {
                        if ((progressEvent.loaded / progressEvent.total) > 0 && (progressEvent.loaded / progressEvent.total) < 3)
                        {
                        //alert('I am, uploading');
                        }
                    }

                    if (progressEvent.lengthComputable) {
                        $scope.uploadprogress = (parseInt(progressEvent.loaded * 100/ progressEvent.total) ).toString() + ' %';
                        try{
                            $scope.$apply();
                        }catch(e){}
                    }
                    else {
                        //loadingStatus.increment();
                    }
                };
                    //alert('uploading');
                
                $scope.$apply();
                
                        $scope.isuploading = 1;
                        $scope.file = '';
                        $scope.commentdialog.hide();
                        //$scope.$apply();
                        ft.upload(filepath, uri, win, fail, { params: params, mimeType: 'video/' + extension, fileName: options.fileName });
                }, 2000);
              
            } catch (e) { alert(e);}
        }
        $scope.fileopenfail = function (data) { alert(JSON.stringify(data)); }
        $scope.profilepicselected = function (data) {
            try {
                var filepath = data.filepath;
                //$scope.getimagebase64(data.filepath, $scope.cropit);
                //alert(JSON.stringify(data));
                if (!data.filepath.match(/\.(jpg|jpeg|png|gif)$/)) {
                    alert('Please select an image');
                    return;
                }
                $scope.isloading = true;

                window.plugins.Base64.encodeFile(data.filepath, function (base64) {
                    //console.log('file base64 encoding: ' + base64);
                    $("#image-editor").cropit('destroy');
                    $scope.cropit(base64);
                });
                $scope.isloading = false;

            } catch (e) {
                alert(e); $scope.isloading = false;
            }
        }
        $scope.profilepicfailed = function (data) { alert(JSON.stringify(data)); }
        $scope.uploadandroid = function (filepath) {
            try {
              //  alert('>1786'+filepath);
            $scope.isuploading = 1;
            $scope.file = '';

            $scope.commentdialog.hide();

            var uri = encodeURI("https://api2-eu-west-1.transloadit.com/assemblies");
            var options = new FileUploadOptions();
            options.fileKey="file";
            options.fileName=filepath.substr(filepath.lastIndexOf('/')+1);

            var ft = new FileTransfer();
            ft.onprogress = function(progressEvent) {
                if (progressEvent.lengthComputable) {
                    loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
                } 
                else {
                    loadingStatus.increment();
                }
            };

            ft.upload(filepath, uri, win, fail, options);  
            } catch (e) { alert(e); }
        }
        $scope.changing = '';
        $scope.changeemail = function () {
            $scope.changing = 'email';
            $scope.dialogpassword.show();
        }
        $scope.changeusername = function () {
            $scope.changing = 'username';
            $scope.dialogpassword.show();
        }
        $scope.changeprivacy = function () {
            $scope.changing = 'privacy';
            $scope.dialogpassword.show();
        }
        $scope.changesetting = function () {
            if ($scope.changing == 'email')
            {
                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                $scope.isloading = true;
                $.ajax({
                    url: "https://www.bracketdash.com/api/api.php",
                    type: "POST",
                    data: {
                        action: 'edit_email', email: $scope.changesettings.registeremail, password: $scope.changesettings.confirmpassword,
                        authorization: 'Bearer ' + access_token
                    },
                    crossDomain: true,
                    success: function (data) {
                        var obj = JSON.parse(data);
                        $scope.isloading = false;
                        $scope.dialogpassword.hide();
                        if (obj.status == "success") {
                            $scope.result = { id: 1, msg: 'Your email has been changed successfuly', css: 'successtoolbar' };
                            $scope.$apply();
                             self.userinfo.Email = $scope.changesettings.registeremail;
                        }
                        else {
                            $scope.result = { id: -1, msg: obj.reason, css: 'errortoolbar' };
                            $scope.$apply();
                           
                        }
                    },
                    error: function (data) {
                        $scope.dialogpassword.hide();
                        $scope.isloading = false;

                            $scope.result = { id: -1, msg: 'Your email could not be changed', css: 'errortoolbar' };
                            $scope.$apply();
                       
                    }
                });
            }

            if ($scope.changing == 'username') {
                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                $scope.isloading = true;
                $.ajax({
                    url: "https://www.bracketdash.com/api/api.php",
                    type: "POST",
                    data: {
                        action: 'edit_username', username: $scope.changesettings.registerusername, password: $scope.changesettings.confirmpassword
                        , authorization: 'Bearer ' + access_token
                    },
                    crossDomain: true,
                    success: function (data) {
                        var obj = JSON.parse(data);
                        $scope.isloading = false;
                        $scope.dialogpassword.hide();
                        if (obj.request_status == "success") {
                            localStorage.access_token = obj.response.access_token;
                            sessionStorage.access_token = obj.response.access_token;
                            $scope.result = { id: 1, msg: 'Your username has been changed successfuly', css: 'successtoolbar' };
                            $scope.$apply();
                            self.userinfo.Username = $scope.changesettings.registerusername;
                        }
                        else {
                            $scope.result = { id: -1, msg: obj.reason, css: 'errortoolbar' };
                            $scope.$apply();
                           
                        }
                    },
                    error: function (data) {
                        $scope.dialogpassword.hide();
                        $scope.isloading = false;

                        $scope.result = { id: -1, msg: 'Your username could not be changed', css: 'errortoolbar' };
                        $scope.$apply();

                    }
                });
            }

            if ($scope.changing == 'privacy') {
                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                $scope.isloading = true;
                $.ajax({
                    url: "https://www.bracketdash.com/api/api.php",
                    type: "POST",
                    data: { action: 'save_privacy_settings', privacy_settings_updates: JSON.stringify($scope.privacysettings), password: $scope.changesettings.confirmpassword, authorization: 'Bearer ' + access_token },
                    crossDomain: true,
                    success: function (data) {
                        var obj = JSON.parse(data);
                        $scope.isloading = false;
                        $scope.dialogpassword.hide();
                        if (obj.status == "success") {
                            $scope.result = { id: 1, msg: 'Your privacy settings has been changed successfuly', css: 'successtoolbar' };
                            $scope.$apply();
                            self.userinfo.Username = $scope.changesettings.registerusername;
                        }
                        else {
                            $scope.result = { id: -1, msg: obj.reason, css: 'errortoolbar' };
                            $scope.$apply();

                        }
                    },
                    error: function (data) {
                        $scope.dialogpassword.hide();
                        $scope.isloading = false;

                        $scope.result = { id: -1, msg: 'Your privacy settings could not be changed', css: 'errortoolbar' };
                        $scope.$apply();

                    }
                });
            }
        }
        $scope.changepassword = function () {
            if ($scope.changesettings.registeroldpassword.length == 0 || $scope.changesettings.registerpassword.length == 0 || $scope.changesettings.registerpasswordconfirm.length == 0)
            {
                $scope.changesettings.registerpasswordvalid = "Please enter the missing fields";
                return;
            }
            if ($scope.changesettings.registerpassword != $scope.changesettings.registerpasswordconfirm) {
                $scope.changesettings.registerpasswordvalid = "Passwords don't match";
                return;
            }
                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                $scope.isloading = true;
                $.ajax({
                    url: "https://www.bracketdash.com/api/api.php",
                    type: "POST",
                    data: { action: 'edit_password', current_password: $scope.changesettings.registeroldpassword, new_password: $scope.changesettings.registerpassword, authorization: 'Bearer ' + access_token },
                    crossDomain: true,
                    success: function (data) {
                        var obj = JSON.parse(data);
                        $scope.isloading = false;
                        $scope.dialogpassword.hide();
                        if (obj.status == "success") {
                            $scope.result = { id: 1, msg: 'Your password has been changed successfuly', css: 'successtoolbar' };
                            $scope.$apply();

                        }
                        else {
                            $scope.result = { id: -1, msg: obj.reason, css: 'errortoolbar' };
                            $scope.$apply();
                           
                        }
                    },
                    error: function (data) {
                        var obj = JSON.parse(data);
                        $scope.dialogpassword.hide();
                        $scope.isloading = false;
                        $scope.result = { id: -1, msg: 'Your password could not be changed', css: 'errortoolbar' };
                        $scope.$apply();
                    }

                });
           
        }

        $scope.logintocontinue = 'login';
        $scope.setloginmode = function (mode) {
            $scope.logintocontinue = mode;
        }
        $scope.resetloginmode = function () { $scope.logintocontinue = 'login'; }
        $scope.logincallback ;
        $scope.setlogincallback = function (fun, p1, p2) { $scope.logincallback = { fun: fun, p1: p1, p2: p2 } };
        $scope.requestlogin = function () {
            if (!self.isloggedin) {
                $scope.dialoglogintocontinue.show();
                return;
            }
        }
        $scope.showterms = function () {
                $scope.dialogterms.show();
                return;
            }
        $scope.resendconfirmation = function () {

            var material;
            var mod = material ? 'material' : undefined;
            ons.notification.confirm({
                message: 'Do you want to resend the confirmation email?',
                modifier: mod,
                callback: function (idx) {
                    switch (idx) {
                        case 0:

                            break;
                        case 1:
                            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                            var data = { "action": "resend_confirmation_email",  authorization: "Bearer " + access_token };

                            $.ajax({
                                url: "http://www.bracketdash.com/api/api.php",
                                type: 'POST',
                                data: data,
                                crossDomain: true,
                                success: function (data) {
                                    //console.log(data);
                                    var obj = JSON.parse(data);
                                    //console.log(obj);
                                    if (obj.status == 'success') {
                                        $scope.result = { id: 1, msg: 'Confirmation email has been re-sent.', css: 'successtoolbar' };
                                        $scope.$apply();
                                    }
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                                }
                            });
                            return true;
                            break;
                    }
                }
            });


            return true;

        }
})
.controller("FileController", function ($scope, $rootScope, $filter, $fileFactory) {
    $scope.files = [];
    var fs = new $fileFactory();

    $scope.getroot = function () {
        try {
            //alert();
            fs.getFS();
            //fs.getEntriesAtRoot();
            //fs.getEntriesAtRoot().then(function (result) {
            //    alert(JSON.stringify(result));
            //    $scope.files = result;
            //}, function (error) { alert(JSON.stringify( error)); })
        }
        catch (e) { alert(e); }
    }

        $scope.getContents = function (path) {
            fs.getEntries(path).then(function (result) {
                $scope.files = result;
                $scope.files.unshift({ name: "[parent]" });
                fs.getParentDirectory(path).then(function (result) {
                    result.name = "[parent]";
                    $scope.files[0] = result;
                });
            });
        }
    

})
.controller('UploadController', ['$scope', 'Transloadit', (function($scope, Transloadit) {
    $scope.upload = function(file) {
      
    }
})])
.factory("$fileFactory", function ($q) {
    var File = function () { };
    File.prototype = {
        getParentDirectory: function (path) {
            var deferred = $q.defer();
            window.resolveLocalFileSystemURI(path, function (fileSystem) {
                fileSystem.getParent(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },

        getEntriesAtRoot: function () {
            try { 
            var deferred = $q.defer();
            
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                var directoryReader = cordova.file.RootDirectory.createReader();
                //alert(JSON.stringify(fileSystem.root));
                directoryReader.readEntries(function (entries) {
                    deferred.resolve(entries);
                }, function (error) {
                    deferred.reject(error);
                });
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
            } catch (e) { alert(e); }
        },

        getFS: function getFS() {
            //store = cordova.file.externalRootDirectory;
            //window.resolveLocalFileSystemURL(store, this.dir, this.cannotopen);

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                var sdcard = fileSystem.root;
                alert(JSON.stringify(sdcard));
                sdcard.getDirectory('data', { create: false }, function (dcim) {
                    var directoryReader = dcim.createReader();
                    alert(JSON.stringify(directoryReader));
                    directoryReader.readEntries(function (entries) {
                        alert(JSON.stringify(entries));
                        for (var i = 0; i < entries.length; i++) {
                            entries[i].file(function (f) {
                                var reader = new FileReader();
                                reader.onloadend = function (evt) {
                                    var url = evt.target.result;//base64 data uri
                                    //console.log(url)
                                    reader.abort();
                                };
                                reader.readAsDataURL(f);

                            }, function (error) {
                                //console("Unable to retrieve file properties: " + error.code);

                            });
                        }
                    }, function (e) {
                        alert(JSON.stringify(e));
                    });
                }, function (error) {
                    alert('Error' + JSON.stringify(error));
                });


            }, function (evt) { // error get file system
                alert(JSON.stringify(evt));
            });
        },
        dir : function dir(filesystem) {
            alert(JSON.stringify(filesystem));
            var sdcard = fileSystem.root;

            sdcard.getDirectory('dcim/camera', { create: false }, function (dcim) {
                var directoryReader = dcim.createReader();
                directoryReader.readEntries(function (entries) {
                    for (var i = 0; i < entries.length; i++) {
                        alert(JSON.stringify(entries)[i]);
                        entries[i].file(function (f) {
                            var reader = new FileReader();
                            reader.onloadend = function (evt) {
                                var url = evt.target.result;//base64 data uri

                                //console.log(url)
                                reader.abort();
                            };
                            reader.readAsDataURL(f);

                        }, function (error) {
                            console("Unable to retrieve file properties: " + error.code);

                        });

                    }

                }, function (e) {
                    console.log(e.code);
                });
            });
            //var file = entry.file(gotfile, downloadAsset);
            try {
                var directoryReader = filesystem.createReader();
                alert(JSON.stringify(directoryReader));
                directoryReader.readEntries(function (entries) {
                    var i;
                    for (i = 0; i < entries.length; i++) {
                        if (entries[i].name === "DCIM") {
                            var dcimReader = entries[i].createReader();
                            dcimReader.readEntries(this.onGetDCIM, this.cannotopen);
                            break; // remove this to traverse through all the folders and files
                        }
                    }
                }, function () {
                    window.console.log("fail");
                });
            //store = cordova.file.dataDirectory;
            ////cordova.file.dataDirectory.getFile(store + "test.txt", { create: false }, gotfile, downloadAsset); //of requestFileSystem
            //window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            //    alert("directory filesystem = " + fs.root.toURL());
            //}, function () {
            //    alert("failed to get file system")
            //});

            } catch (e) { alert(JSON.stringify(e)); }
        },
        cannotopen: function cannotopen(entry) { alert(JSON.stringify(entry)); },
        //getEntries: function (path) {
        //    var deferred = $q.defer();
        //    window.resolveLocalFileSystemURI(path, function (fileSystem) {
        //        var directoryReader = fileSystem.createReader();
        //        directoryReader.readEntries(function (entries) {
        //            deferred.resolve(entries);
        //        }, function (error) {
        //            deferred.reject(error);
        //        });
        //    }, function (error) {
        //        deferred.reject(error);
        //    });
        //    return deferred.promise;
        //}

        onGetDCIM: function onGetDCIM(entries) {
            var i;
            for (i = 0; i < entries.length; i++) {
                    var mediaReader = entries[i].createReader();
                    mediaReader.readEntries(this.onGetFileNames, this.cannotopen);
                    break; // remove this to traverse through all the folders and files
                //This will log all files and directories inside 100MEDIA
                alert(" >>>>>>> " + entries[i].name);
            }
        },

        onGetFileNames: function onGetFileNames(entries) {
        var i;
        for (i = 0; i < entries.length; i++) {
            //if (/\.(jpe?g|png|gif|bmp)$/i.test(entries[i].name)) {
                app.mediaFiles.push(entries[i]);
            //}
            //This will log all image files found
            alert(" $$$$$ " + entries[i].name);
        }
    }
    };
    return File;
    //getFS();
    
})
.factory("$filechooser", function () {
    var FileChooser = function () {};
    FileChooser.prototype = {
        open: function (params, success, fail) {
            try {
               // alert('f');
                return cordova.exec(function (args) { success(args); }, function (args) { fail(args); },
                    'FileChooser', 'open', [params || {}]);
            } catch (e) { alert(e);}
        },
        success: function (data) { alert('>>><<<<'+data.filepath); },
        fail: function (data) { alert(data);}
    }
    return FileChooser;

})
.factory("$fileuploader", function () {
    //var options;// = new FileUploadOptions();
    //  options.fileKey = "file";
    //options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    //options.mimeType = "text/plain";

    //var params = new Object();
    //params.auth = { key: "622e18e0d81111e5b7ff9bc4624f6488" };
    //params.steps = {resize_to_125: {robot: "/image/resize",use: ":original",width: 125,height: 125}, 
    //    resize_to_75: {robot: "/image/resize",use: "resize_to_125",width: 75,height: 75,sepia: 80}};

    //options.params = params;

    
    var FileUploader = function () {};
    FileUploader.prototype = {
         win : function (r) {
            //console.log("Code = " + r.responseCode);
            //console.log("Response = " + r.response);
            //console.log("Sent = " + r.bytesSent);
        },

        fail : function (error) {
            //alert("An error has occurred: Code = " + error.code);
            //console.log("upload error source " + error.source);
            //console.log("upload error target " + error.target);
        },
        upload: function () {
            var ft = new FileTransfer();
            ft.upload(fileURI, encodeURI("//api2.transloadit.com/assemblies"), this.win, this.fail, {});
        }
    }
    return FileUploader;
})
.factory('Transloadit', ['$http', '$rootScope', '$timeout', function($http, $rootScope, $timeout) {
    $scope = $rootScope.$new();
    var TRANSLOADIT_API = 'https://api2-eu-west-1.transloadit.com/assemblies';

    function getExpiryDate() {
        var date = new Date();
        date.setHours(date.getHours() + 12);

        var year = date.getUTCFullYear();
        var month = zeroFill(date.getUTCMonth() + 1, 2);
        var day = zeroFill(date.getUTCDate(), 2);

        var hours = zeroFill(date.getUTCHours(), 2);
        var minutes = zeroFill(date.getUTCMinutes(), 2);
        var seconds = zeroFill(date.getUTCSeconds(), 2);

        return year + '/' + month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds + '+00:00';
    }

    function zeroFill(number, width) {
        width -= number.toString().length;
        if (width > 0) {
            return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
        }

        return number + ""; // always return a string
    }

    return {
        upload: function(file, options) {
            var cancelled = false;
            var xhr = new XMLHttpRequest();

            this._validateBrowser();
            this._validateOptions(options);
            this._addExpiryDate(options);

            function check(assemblyUrl) {
                if (cancelled) {
                    return false;
                }

                $timeout(function() {
                    $http.get(assemblyUrl).success(function(results) {
                        if (results.ok === 'ASSEMBLY_COMPLETED') {
                            options.uploaded(results);
                        } else {
                            if (results.error ) {
                                options.error(results);
                            } else {
                                    check(results.assembly_ssl_url);
                                }
                            
                        }
                    }).error(options.error);
                }, 2000);
            }

            options.signature(function(signatureValue) {
                var paramsValue = angular.toJson(options.params);
                //alert(paramsValue);
                var formData = new FormData();
                formData.append('params', paramsValue);
                //formData.append('signature', signatureValue);
                formData.append(file.name, file);

                xhr.open('POST', TRANSLOADIT_API, true);
                xhr.onload = function(response) {
                    var results = angular.fromJson(this.response);
                    options.processing();
                    check(results.assembly_ssl_url);
                };
                xhr.upload.onprogress = function(e) {
                    if (e.lengthComputable) {
                        options.progress(e.loaded, e.total);
                    }
                };

                xhr.send(formData);
            });

            
            return {
                cancel: function() {
                    cancelled = true;
                    xhr.abort();
                }
            };
        },

        _validateBrowser: function() {
            var isXHR2 = typeof new XMLHttpRequest().upload !== 'undefined';

            if (!isXHR2) {
                throw new Error('Transloadit will only work with XMLHttpRequest 2');
            }
        },

        _validateOptions: function(options) {
            // mandatory fields
            if (!options.signature) {
              // throw new Error('must supply a signature function');
            }

            if (!options.uploaded) {
                throw new Error('must supply an uploaded callback');
            }

            if (!options.params) {
                throw new Error('must supply params');
            }

            if (!options.params.auth.key) {
                throw new Error('must supply a key');
            }

            // optional fields
            options.processing = options.processing || function() {};
            options.progress = options.progress || function() {};
            options.error = options.error || function() {};
        },

        _addExpiryDate: function(options) {
            options.params.auth.expires = getExpiryDate();
        },

        _setApiUrl: function(url) {
            TRANSLOADIT_API = url;
        }
    };
}]);

