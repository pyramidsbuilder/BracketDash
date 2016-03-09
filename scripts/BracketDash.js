
angular.module('app', ['onsen', 'ngAnimate', 'ngSanitize'])
    .controller('BracketDashController', function ($scope, $rootScope, $filter, $sce) {
        $scope.feed = {};
        $scope.feedlimit = 10;
        $scope.notificationlimit = 10;
        $scope.commentlimit = 10;
        $scope.conversationlimit = 10;
        $scope.bio = {};
        $scope.NewActivity = {
            type: '', title: '', description: '', round: 1, category: 'Entertainment', visibility: 'public',
            branchlength: 4, branches: [], contestants: [], status: ''
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
        $scope.CurrentConversation = {};

        $scope.history = [];

        $scope.isuploading = 0;
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
        self.collapseall = function () {
            self.activityexpand = false; self.accountexpand = false; self.settingsexpand = false;
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
        };
        self.userinfo = null;

        self.setMainPage = function (page, args, Title) {
            $scope.history.push({ page: page, args: args, title: Title });
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
                $scope.searchquery.q = '';
                self.goback(2);

            } else {
                self.overlaylement('searchinput', 'searchicon', null, 35, null, null, null, null, 'slide-right');
                //self.overlaylement('icncancelsearch', 'txtsearch', 1, 0, 0, null, null, 'slide-right');
                self.setMainPage('Search.html', {}, 'Search');
                self.issearching = true;
            }

        }

        self.goback = function (step) {
            var history = $scope.history[$scope.history.length - step];
            self.setMainPage(history.page, history.args, history.title);
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


        $scope.login = function () {
            $scope.isloading = true;
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
                        self.getmyprofile(false);
                    } else if (obj.request_status == 'invalid_password') {
                        alert("Invalid password");
                    } else if (obj.request_status == 'invalid_email') {
                        alert("Invalid email address");
                    }
                },
                error: function (data) {
                    $scope.isloading = false;
                    alert(jSON.stringify(data));
                }
            });
            return true;
        }
        self.logout = function () {
            localStorage.removeItem('access_token');
            self.getfeed('explore', 'Explore')
            self.isloggedin = false;
            self.userinfo = {};
            
        }
        self.validateactivity = function () {
            $scope.newactivityvalidation = { status: true, reason: 'valid' };

            if (!$scope.NewActivity.title || $scope.NewActivity.title.toString().length == 0) {
                $scope.newactivityvalidation = { status: false, reason: 'Please enter activity title' };
            }
            if (!$scope.NewActivity.description || $scope.NewActivity.description.toString().length == 0) {
                $scope.newactivityvalidation = { status: false, reason: 'Please enter activity decription' };
            }
            if (!$scope.NewActivity.category || $scope.NewActivity.category == '') {
                $scope.newactivityvalidation = { status: false, reason: 'Please select activity category' };
            }
            if ($scope.NewActivity.type=='bracket' && $scope.NewActivity.branchlength / 4 != 1) {
                $scope.newactivityvalidation = { status: false, reason: 'Branches can be 4, 8, 16' };
            }
            for (var i = 0; i < $scope.NewActivity.branches; i++) {
                for (var k = 0; k < $scope.NewActivity.branches[i].contestants; i++) {
                    if ($scope.NewActivity.branches[i].contestants[k].username == '') {
                        $scope.newactivityvalidation = { status: false, reason: 'please fill all users of the branches' };
                    }
                }
            }
        }
        self.addactivity = function () {
            self.validateactivity();
            // self.formatnewactivity();
            
            if ($scope.newactivityvalidation.status) {
                if (($scope.NewActivity.type == 'challenge' || $scope.NewActivity.type == 'exhibition') && $scope.isuploading == 0) {
                        $scope.uploadcreateactivity = true;
                    self.initupload();
                    return;
                }
                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
                //console.log(JSON.stringify(self.formatnewactivity()));
                console.log(access_token);
                data = { action: 'new_activity', activity_data_array: JSON.stringify(self.formatnewactivity()), authorization: "Bearer " + access_token };

                $.ajax({
                    url: "http://www.bracketdash.com/api/api.php",
                    type: 'post',
                    data: data,
                    crossDomain: true,
                    success: function (data) {
                        console.log(data);
                        var obj = JSON.parse(data);
                        console.log(obj);
                        if (obj.status == 'success') {
                          
                            $scope.NewActivity = {
                                type: '', title: '', description: '', round: 1, category: 'Entertainment', visibility: 'public',
                                branchlength: 4, branches: [], contestants: [], status: ''
                            };
                            $scope.result.id = 1;
                            $scope.result.msg = 'Activity Added Successfuly';
                            $scope.result.css = 'successtoolbar';
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
        $scope.newuser = { registeremail: null, registerpassword: null, registerusername: null, registerpasswordconfirm: null }

        $scope.registervalidation = { status: true, reason: 'unchecked', usernamestatus: 0, emailstatus: 0, passwordstatus: 0, passwordconfirmstatus :0};


        $scope.validateemail = function () {
            if (!$scope.newuser.registeremail || $scope.newuser.registeremail.toString().length == 0) {
                $scope.registervalidation.emailstatus = -1;
                $scope.registervalidation.reason = 'Please enter your email address.';
                
            } else { $scope.checkmail(); }
            
        }
        $scope.validateusername = function () {

            if (!$scope.newuser.registerusername || $scope.newuser.registerusername.toString().length == 0) {
                $scope.registervalidation.usernamestatus = -1;
                $scope.registervalidation.reason = 'Please enter your username.';
            } else { $scope.checkusername(); }
        }
        $scope.validatepassword = function () {
            if (!$scope.newuser.registerpassword || $scope.newuser.registerpassword.toString().length == 0) {
                $scope.registervalidation.passwordstatus = -1;
                $scope.registervalidation.reason = 'Please enter your password.';
            }
            else { $scope.registervalidation.passwordstatus = 1; }
            
        }
        $scope.validatepasswordconfirm = function () {
            if (!$scope.newuser.registerpasswordconfirm || $scope.newuser.registerpasswordconfirm.toString().length == 0) {
                $scope.registervalidation.passwordconfirmstatus = -1;
                $scope.registervalidation.reason = 'Please enter your password.' ;
            }
            else  if ($scope.newuser.registerpassword != $scope.newuser.registerpasswordconfirm) {
                    $scope.registervalidation.passwordconfirmstatus = -1;
                    $scope.registervalidation.reason = 'Passwords do not match.';
                }
            else
            {$scope.registervalidation.passwordconfirmstatus = 1;}
        }


        $scope.checkingemail = false;
        $scope.checkmail = function () {
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'post',
                data: { action: 'check_email', Email_Address: $scope.newuser.registeremail, email: $scope.newuser.registeremail },
                crossDomain: true,
                success: function (data) {
                    var obj = JSON.parse(data);
                    if (obj.response.indexOf("Email already in our system") > -1) {
                        
                        $scope.registervalidation.emailstatus = -1;
                        $scope.registervalidation.reason = obj.response;
                    }
                    else {
                        $scope.registervalidation.emailstatus = 1;
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
                            $scope.registervalidation.reason = obj.response;
                        }
                        else {
                            $scope.registervalidation.usernamestatus = 1;
                        }

                    $scope.$apply();
                },
                error: function (data) { alert(JSON.stringify(data)); $scope.isloading = false; }
            });

        }
        $scope.register = function () {
            $scope.isloading = true;
            if ($scope.registervalidation.status < 1 || $scope.registervalidation.usernamestatus < 1 || $scope.registervalidation.emailstatus < 1
                || $scope.registervalidation.passwordstatus < 1 || $scope.registervalidation.passwordconfirmstatus < 1) {
                $scope.registervalidation.status = false;
                $scope.isloading = false;
                return;
            }
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'post',
                data: {
                    action: 'signup', email: $scope.newuser.registeremail,
                    fullname: $scope.newuser.registerpassword, username: '', password: $scope.newuser.registerusername
                },
                crossDomain: true,
                success: function (data) {
                    $scope.isloading = false;
                    console.log(data);
                    var obj = JSON.parse(data);
                    console.log(obj);
                    if (obj.request_status == 'success') {
                        var access_token = obj.response.access_token;
                        var exp = obj.response.exp;
                        var username = obj.response.username;
                        self.storetoken(access_token, username, exp, true);
                        self.getmyprofile(true);
                        self.isloggedin = true;
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
                data: { action: 'search_activity', searchquery: q, limit: 10 },
                success: function (data) {
                    console.log(data);
                    var obj = JSON.parse(data);
                    $scope.searchresult.activity = obj.search_result;
                    angular.extend($scope.searchresult.activity, obj.search_result);

                    $.ajax({
                        type: 'POST',
                        crossDomain: true,
                        url: 'http://www.bracketdash.com/api/api.php',
                        data: { action: 'search_user', searchquery: q, limit: 10 },
                        success: function (userdata) {
                            console.log(userdata);
                            var objuser = JSON.parse(userdata);
                            $scope.searchresult.people = objuser.search_result;
                            angular.extend($scope.searchresult.people, objuser.search_result);
                            $scope.$apply();
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
        self.expandfeed = function (id) {
            if (self.feedexpand == id) {
                $scope.currentfeed = {};
                $scope.commentdialog.hide();
                self.feedexpand = -1;
//                $scope.$apply();
               
            }
            else {
               
                self.feedexpand = id;
                $scope.currentfeed = $filter('filter')($scope.feed.obj, { activity_id: id })[0];
                self.getcomments(id);

                $scope.commentdialog.show();
                $scope.currentfeed.mode = 1;
//                $scope.$apply();
                
            }
        }

        self.deleteactivity = function (id) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var data = { "action": "delete_activity", "activity_id": $scope.currentfeed.activity_id, authorization: "Bearer " + access_token };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    console.log(data);
                    var obj = JSON.parse(data);
                    console.log(obj);
                    if (obj.status == 'success') {
                        $scope.result = { id: 1, msg: 'Activity Deleted Successfuly', css: 'successtoolbar' };
                        self.hidecomments(id);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
        }
        self.hidecomments = function (id) {
            if (self.feedexpand == id) {
                $scope.currentfeed = {};
                $scope.commentdialog.hide();
                self.feedexpand = -1;
               
            }
         
        }


        self.getcomments = function (id, limit) {
            if (!limit)
                limit = 10;
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'Get',
                data: { action: 'output_comments', activity_id: id, limit: limit },
                crossDomain: true,
                success: function (data) {
                    var obj = JSON.parse(data);
                    $scope.currentfeed.comments = obj;
                    angular.extend($scope.currentfeed.comments, obj);
                    $scope.$apply();
                    $scope.commentlimit = limit;
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
        }

        $scope.reportcomment = function (material,id) {
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
                                    ons.notification.alert({
                                        message: 'Thanks we have received your report.',
                                        modifier: mod
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
                    //self.getbio(null);

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
                    for (var i = 0; i < json_obj.search_result.length; i++) {
                        json_obj.search_result.selected = false;

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
                $scope.usersearchresult = $scope.NewActivity.contestants;
            }
            else {

                $scope.usersearchresult = [];
                $scope.currentbranchuser.branch_no = branch_no;
                $scope.currentbranchuser.userindex = userindex;
                if ($scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Username.length > 0) {
                    //alert('there is user');
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].selected = true;
                    $scope.usersearchresult.push($scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex]);
                }
            }
            $scope.popoveruserselect.show($event);

        }
        $scope.checkuser = function ($event, user) {
            if ($scope.NewActivity.type == 'bracket') {
                if (user.selected) {
                    if ($scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[0].Username == user.Username || $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[1].Username == user.Username) {
                        alert('Please select two different users!');
                        return;
                    }
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Username = user.Username;
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Avatar_link = user.Avatar_link;
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Fullname = user.Fullname;
                    //$scope.popoveruserselect.hide($event);
                }
                else {
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Username = '';
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Avatar_link = '';
                    $scope.NewActivity.branches[$scope.currentbranchuser.branch_no].contestants[$scope.currentbranchuser.userindex].Fullname = '';
                    //$scope.usersearchresult = [];
                }
            }
            if ($scope.NewActivity.type == 'battle') {
                var exist = $filter('filter')($scope.NewActivity.contestants, { Username: user.Username }).length > 0;
                var newuser = { Username: user.Username, Avatar_link: user.Avatar_link, Fullname: user.Fullname, selected: true };
                if (exist && !user.selected) {
                    var ind = $scope.NewActivity.contestants.indexOf(newuser);
                    $scope.NewActivity.contestants.splice(ind, 1);
                }
                else {
                    if (user.selected == true) {
                        $scope.NewActivity.contestants.push(newuser);
                        //alert(JSON.stringify($scope.user));
                    }
                }
            }
            $scope.searchuserquery.q = '';
        }
        self.getbio = function ajax_bio(profile_username, navigate) {
            if (profile_username == null) {
                console.log("self.userinfo" + JSON.stringify(self.userinfo))
                profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
                $scope.viewuserinfo = self.userinfo;
                console.log("viewuserinfo" + JSON.stringify($scope.viewuserinfo))

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
                        console.log(JSON.stringify(json_obj))
                        $scope.viewuserinfo.bio = json_obj;

                        angular.extend($scope.viewuserinfo.bio, json_obj);
                        console.log("bio" + JSON.stringify($scope.viewuserinfo.bio))
                        //self.setMainPage('BioContent.html', { closeMenu: true }, "Bio");
                        $scope.isloading = false;
                        if (navigate)
                            self.setMainPage('BioContent.html', { closeMenu: true }, $scope.viewuserinfo.Fullname + '\'s profile');

                        self.getaudience(profile_username, false);

                    },
                    error: function (data) {
                        $scope.isloading = false;
                    }
                });
            }
            else {
                self.setMainPage('BioContent.html', { closeMenu: true }, $scope.viewuserinfo.Fullname + '\'s profile');
            }

        }
        self.getfeed = function (action, title, limit) {
            try {
                if (!limit)
                    limit = 10;
                $scope.isloading = true;
                var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
                var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
                $.ajax({
                    type: 'GET',
                    url: "http://www.bracketdash.com/api/api.php",
                    data: { action: action, limit: limit },
                    crossDomain: true,
                    success: function (data) {
                        $scope.feedlimit = limit;
                        console.log(data);
                        var json_obj = JSON.parse(data);
                        console.log(json_obj);
                        var obj = json_obj.obj;
                        console.log(obj);
                        $scope.feed = json_obj;
                        angular.extend($scope.feed, json_obj);
                        $scope.feed.hasmore = true;
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
        self.loadmorefeed = function () {
            try {
                alert('not implemented');
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

                        console.log(data);
                        var json_obj = JSON.parse(data);
                        console.log(json_obj);
                        var obj = json_obj.obj;
                        console.log(obj);
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
        self.getpanel = function (action, title) {
            $scope.isloading = true;
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            var data = { action: action, profile_username: profile_username, limit: 10, authorization: "Bearer " + access_token };
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",

                data: data,
                crossDomain: true,
                success: function (data) {
                    console.log(data);
                    var json_obj = JSON.parse(data);
                    console.log(json_obj);
                    var obj = json_obj.obj;
                    console.log(obj);
                    $scope.feed = json_obj;
                    angular.extend($scope.feed, json_obj);
                    self.setMainPage('page1.html', { closeMenu: true }, title);
                    $scope.isloading = false;
                },
                error: function (data) {
                    $scope.isloading = false;
                }
            });
        }
        self.getactivityinprogress = function (username, navigate, title) {
            $scope.isloading = true;
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            //var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            var data = { action: 'activity_in_progress', profile_username: username, limit: 10, authorization: "Bearer " + access_token };
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                data: data,
                crossDomain: true,
                success: function (data) {
                    var json_obj = JSON.parse(data);
                    var obj = json_obj.obj;
                    $scope.viewuserinfo.feedinprogress = json_obj;
                    angular.extend($scope.viewuserinfo.feedinprogress, json_obj);
                    if (navigate)
                        self.setMainPage('page1.html', { closeMenu: true }, title);
                    $scope.isloading = false;
                },
                error: function (data) {
                    $scope.isloading = false;
                }
            });
        }
        self.getactivitylog = function (username, navigate) {
            $scope.isloading = true;
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            //var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            var data = { action: 'activity_log', profile_username: username.toString(), limit: 10, authorization: "Bearer " + access_token };

            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",

                data: data,
                crossDomain: true,
                success: function (data) {
                    var json_obj = JSON.parse(data);
                    var obj = json_obj.obj;
                    $scope.viewuserinfo.feed = json_obj.obj;
                    angular.extend($scope.viewuserinfo.feed, json_obj.obj);
                    if (navigate)
                        self.setMainPage('page1.html', { closeMenu: true }, 'Activities');
                    if (self.userinfo.Username == username) {
                        self.getactivityinprogress(username, false, 'In Progress');
                    }
                    $scope.isloading = false;
                },
                error: function (data) {
                    $scope.isloading = false;
                }
            });
        }
        self.getsingleactivity = function (activity_id, title) {
            $scope.isloading = true;
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            var data = { action: "output_activity", activity_id: activity_id };
            $('#confirmationtoolbar').css('display','none');
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",

                data: data,
                crossDomain: true,
                success: function (data) {
                    console.log(data);
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
        self.getaudience = function ajax_audience(username, navigate) {
            $scope.isloading = true;
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                crossDomain: true,
                data: { action: 'audience', profile_username: username, limit: 10 },
                success: function (data) {
                    var json_obj = JSON.parse(data);
                    var obj = json_obj.obj;
                    $scope.viewuserinfo.audience = json_obj.obj;
                    angular.extend($scope.viewuserinfo.audience, json_obj.obj);
                    if (navigate)
                        self.setMainPage('BioContent.html', { closeMenu: true }, 'Audience');
                    $scope.isloading = false;
                    $scope.$apply();

                    self.getactivitylog(username, navigate);
                    $scope.isloading = false;

                },
                error: function (data) {
                    $scope.isloading = false;
                }
            });
        }
        $scope.playvideo = function (videolink) {

            $scope.isplaying = $sce.trustAsResourceUrl(videolink);

        }
        $scope.closevideo = function () {


        }
 
        $scope.getnotifications = function (limit) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            if (!limit)
                limit = 10;
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                crossDomain: true,
                data: {
                    action: 'output_notifications',
                    limit: limit,
                    authorization: "Bearer " + access_token
                },
                success: function (data) {
                    $scope.notificationlimit = limit;
                    var json_obj = JSON.parse(data);
                    $scope.notifications = json_obj;
                    angular.extend($scope.myaudience, json_obj);
                    self.setMainPage('Notifications.html', { closeMenu: true }, 'Notifications');

                }
            });
        }


        $scope.getmessages = function (limit) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            //self.setMainPage('Messages.html', { closeMenu: true }, 'Messages')
            //return;
            if (!limit)
                limit = 10;
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                crossDomain: true,
                data: {
                    action: 'output_inbox',
                    limit: limit,
                    authorization: "Bearer " + access_token
                },
                success: function (data) {
                    //alert(data);
                    var json_obj = JSON.parse(data);
                    console.log(json_obj);
                    $scope.messages = json_obj;
                    angular.extend($scope.messages, json_obj);
                    self.setMainPage('Messages.html', { closeMenu: true }, 'Messages');
                }
            });
        }
        $scope.getconversation = function (id,limit) {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
            //$scope.CurrentConversation = { from: {Username: 'eliezer', Fullname:'Eliezer Kombe',Avatar_link:''},
            //    messages: [{ from: { Username: 'eliezer', Fullname: 'Eliezer Kombe', Avatar_link: 'https://bracketdash-users.s3.amazonaws.com/1/profile-picture.jpg' }, text: 'A message', date: '10/10/2013' },
            //        { from: { Username: 'eliezer', Fullname: 'Eliezer Kombe', Avatar_link: 'https://bracketdash-users.s3.amazonaws.com/1/profile-picture.jpg' }, text: 'Another message', date: '10/10/2013' }]
            //}
            //return;
            $.ajax({
                type: 'GET',
                url: "http://www.bracketdash.com/api/api.php",
                crossDomain: true,
                data: {
                    action: 'output_conversation',
                    limit: 10,
                    conversation_id: id,
                    authorization: "Bearer " + access_token
                },
                success: function (data) {
                    //alert(data);
                    var json_obj = JSON.parse(data);
                    $scope.CurrentConversation = json_obj;
                    angular.extend($scope.CurrentConversation, json_obj);
                    //alert(JSON.stringify($scope.CurrentConversation));
                    //alert(self.userinfo.Username);
                    $scope.CurrentConversation.with = $filter('filter')($scope.CurrentConversation, { username: '!'+self.userinfo.Username })[0];
                    //alert(JSON.stringify($scope.CurrentConversation.with));
                    self.setMainPage('Conversation.html', { closeMenu: true }, 'Conversation')
                   
                }
            });
        }
        $scope.sendmessage = function () {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var privacysettings = { join_audience_settings: self.userinfo.accountsettings.join_audience_settings }
            var destinationarray = [];
            var data = { action: 'input_message', destination: destinationarray, text: '', authorization: "Bearer " + access_token };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    //alert(data);
                    console.log(data);
                    var obj = JSON.parse(data);
                    console.log(obj);


                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
            self.setMainPage('Messages.html', { closeMenu: true }, 'Messages')
        }
        $scope.sendreply = function () {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var destinationarray = [];
            var data = { action: 'input_reply', conversation_id: $scope.CurrentConversation[0].conversation_id, text: $scope.newmessage.text, authorization: "Bearer " + access_token };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    
                    $scope.getconversation($scope.CurrentConversation[0].conversation_id);

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
                    console.log(json_obj);
                    var profilesettings = json_obj.profile_settings;
                    var accountsettings = json_obj.account_settings;
                    self.userinfo.profilesettings = profilesettings;
                    angular.extend(self.userinfo.profilesettings, profilesettings);
                   // alert(JSON.stringify(self.userinfo.profilesettings));
                    self.userinfo.accountsettings = accountsettings;
                    angular.extend(self.userinfo.accountsettings, accountsettings);


                    $scope.AccountSettingsForm = { Current_password: '', New_password: '', Confirm_password: '' };
                    $scope.PrivacyForm = { Public_audience: self.userinfo.accountsettings.privacy_settings };

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
                    console.log(data);
                    var obj = JSON.parse(data);
                    console.log(obj);
                    

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
        }
        self.saveprofile = function () {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var profile_username = (localStorage.profile_username != null) ? localStorage.profile_username : sessionStorage.profile_username;
           // alert(JSON.stringify(self.userinfo.profilesettings.links.splice()));
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
                    self.getmyprofile(false);
                    
                },
                error: function (jqXHR, textStatus, errorThrown) {
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
                    console.log(data);
                    var obj = JSON.parse(data);
                    console.log(obj);


                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
        }
        $scope.savecomment = function () {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var data = { "action": "input_comment", "comment": $scope.newcomment.text, "activity_id": $scope.currentfeed.activity_id, authorization: "Bearer " + access_token };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    console.log(data);
                    var obj = JSON.parse(data);
                    console.log(obj);
                    if (obj.status == 'success') {
                        self.getcomments($scope.currentfeed.activity_id);
                        //doChange('#profile');
                    } 

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
        }
        self.savereport = function () {
            var access_token = (localStorage.access_token != null) ? localStorage.access_token : sessionStorage.access_token;
            var data = { "action": "report_activity", "rationale": $scope.newcomment.text, "activity_id": $scope.currentfeed.activity_id, authorization: "Bearer " + access_token };
            $.ajax({
                url: "http://www.bracketdash.com/api/api.php",
                type: 'POST',
                data: data,
                crossDomain: true,
                success: function (data) {
                    console.log(data);
                    var obj = JSON.parse(data);
                    console.log(obj);
                    if (obj.status == 'success') {
                        self.getcomments($scope.currentfeed.activity_id);
                        //doChange('#profile');
                    } 

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
                }
            });
            return true;
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
            if ($scope.isplaying.toString().length > 0) {
                $("#iframe").attr('src', 'http://www.bracketdash.com/video/video_player.php?link=' + $scope.isplaying);
                $scope.videodialog.show();
                //var myVideo = document.getElementsByTagName('video')[0];
                //alert($scope.isplaying);
                //myVideo.src = $scope.isplaying;
                //myVideo.load();
                //myVideo.play();
            }
            else {

            }
        });
        $scope.$watch('newuser.registeremail', function (value) {
            if(value !=null)$scope.validateemail();
        });
        $scope.$watch('newuser.registerusername', function (value) {
            if (value != null) $scope.validateusername();
        });
        $scope.$watch('loginobj.loginemail', function (value) {
            if (value != null) { $scope.validateloginemail();  }
        });
        $scope.$watch('loginobj.loginpassword', function (value) {
            if (value != null) { $scope.validateloginpassword(); }
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
            ons.createDialog('dialogcomment.html').then(function (dialog) {
                $scope.commentdialog = dialog;
            });
            ons.createDialog('dialog.html').then(function (dialog) {
                $scope.videodialog = dialog;

            });
            ons.createDialog('invitationdialog.html').then(function (dialog) {
                $scope.invitationdialog = dialog;

            });

            ons.createPopover('popoverfileselect.html').then(function (popoverfileselect) {
                $scope.popoverfileselect = popoverfileselect;
            });

           
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

        self.likevideo = function (activityid, videoid) {
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
                    console.log(data);
                    var obj = JSON.parse(data);
                    console.log(obj);
                    
                    $scope.$apply(function () {
                        var act = $filter('filter')($scope.feed.obj, { activity_id: activityid })[0];
                        var con = $filter('filter')(act.contestants_info, { video_id: videoid })[0];
                        con.likes =  obj.count;

                    });
                }
            });
            return true;
        }

        self.initupload = function () {
            $scope.isuploading = 1;
            $scope.file = '';

            $scope.commentdialog.hide();
            var transloadit = new TransloaditXhr({
                params: {

                    auth: { key: "622e18e0d81111e5b7ff9bc4624f6488" },
                    steps: {
                        resize_to_125: {
                            robot: "/image/resize",
                            use: ":original",
                            width: 125,
                            height: 125
                        },
                        // The second Step resizes the results further to 75x75 pixels.
                        // Notice how we "use" the output files of the "resize_to_125"
                        // step as our input here. We could use all kinds of Steps with
                        // various robots that "use" each other, making this perfect for
                        // any workflow.
                        resize_to_75: {
                            robot: "/image/resize",
                            use: "resize_to_125",
                            width: 75,
                            height: 75,
                            // We also add a sepia effect here just for fun.
                            // The /image/resize robot has a ton of available parameters.
                            sepia: 80
                        }
                    }
                },

                successCb: function (results) {
                    //alert(JSON.stringify(results));
                    $scope.isuploading = 2;
                    $scope.fileuploadresult = 'File uploaded successfully';
                    if ($scope.uploadcreateactivity) {
                        $scope.uploadcreateactivity = false;
                        self.addactivity();
                    }
                    $scope.$apply();

                    //alert("Worked");
                    //alert(JSON.stringify(results));
                },

                errorCb: function (err) {

                    $scope.isuploading = -1;
                    alert(JSON.stringify(err));
                }
            });

            var file = $('#file_input').get(0).files[0];
            transloadit.uploadFile(file);


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

        $scope.confirmupload = function () {
            $scope.isuploading = 0;
        }
        $scope.confirmresult = function () {
            $scope.result.id= 0;
        }
        $scope.file = '';
        $scope.uploadbutton = true;
        $scope.uploadcreateactivity = false;
        $scope.setFiles = function (element, auto,uplaodbtn) {
            $scope.file = $(element).val().substr($(element).val().lastIndexOf("\\") + 1);
            $scope.$apply();
            $scope.uploadbutton = uplaodbtn;
            if (auto)
            { $scope.initupload();}

            $scope.$apply();
        };
        
        $scope.selectfile = function () {
            //alert();
            try{
                fileChooser.open(function (uri) { alert(uri); }, failureCallback);
            } catch (e) { alert(e);}
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
                                    console.log(url)
                                    reader.abort();
                                };
                                reader.readAsDataURL(f);

                            }, function (error) {
                                console("Unable to retrieve file properties: " + error.code);

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

                                console.log(url)
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
    
});

