    function print_header(activity_data) {
        var id = activity_data.activity_id;
        var title = activity_data.activity_title;
        var host = activity_data.activity_host_info.username;
        var avatar_link = activity_data.activity_host_info.avatar_link;
        var date = activity_data.activity_date;
        var activity_type = activity_data.activity_type;
        var status = activity_data.activity_status;
        var category = activity_data.activity_category;
        var header_template = '<div class="activity-header">';//activity header op tag
        header_template += '<div class="activity-host-avatar">';//activity host op tag
        header_template += '<img src="' + avatar_link + '" alt="">';
        header_template += '</div>';//activity host closing tag
        header_template += '<div class="activity-header-txt">';//activity header txt op tag
        header_template += '<div class="activity-header-txt-top-section">';//activity header top txt op tag
        header_template += '<div class="host-username">' +
                            host + '</div>';
        header_template += '<div class="activity-date">' +
                            date + '</div>';
        header_template += '</div>';//activity header top txt closing tag
        header_template += '<div class="activity-title">' +
                            title + '</div>';
        header_template += '<div class="activity-type"> (' +
                            category + ' / ' + activity_type +
                            ')</div>';
        header_template += '</div>';//activity header txt closing tag
        header_template += '</div>';//activity header closing tag
        return header_template;
    }
    function print_footer(activity_data) {
        var description = activity_data.activity_description;
        var footer_template = '<div class="activity-footer">';
        footer_template += '<div class="activity-description">' + description + '</div>';
        footer_template += '<div class="activity-options-button" ng-click="bd.expandfeed(1);"></div>';
        footer_template += '</div>';
        return footer_template;
    }
    function print_exhibition_body(activity_data) {
        var thumbnail_link = activity_data
                            .contestants_info[0]
                            .thumbnail_link;
        var video_link = activity_data
                            .contestants_info[0]
                            .video_link;
        var likes = activity_data.contestants_info[0].likes;
        var body_template = '<div class="activity-body">';
        body_template += '<div class="exhibition-thumbnail">';
        body_template += '<div class="play-button" data-vlink="' + video_link + '"></div>';
        body_template += '<img src="' + thumbnail_link + '">';
        body_template += '</div>';//exhibition thumbnail closing tag
        body_template += '<div class="likes-ratings">';
        body_template += '<div class="like-button"></div>';
        body_template += '<div class="like-count">' + likes + '</div>';
        body_template += '</div>';//likes ratings button
        body_template += '</div>';//body closing tag
        return body_template;
    }
    function print_battle_body(activity_data) {
        var contestant_no = activity_data.contestants_info.length;
        var contestant_info_array = activity_data.contestants_info;
        var body_template = '<div class="activity-body">';
        if (contestant_no == 2) {
            for (i = 0; i < contestant_no; i++) {
                var username = contestant_info_array[i]
                                .contestant_username;
                var avatar_link = contestant_info_array[i]
                                .avatar_link;
                var thumbnail_link = contestant_info_array[i]
                                .thumbnail_link;
                var video_link = contestant_info_array[i]
                                .video_link;
                var likes = contestant_info_array[i]
                                .likes;
                var rank = contestant_info_array[i]
                                .rank;
                body_template += '<div class="contestant-section">';
                body_template += '<div class="section-badge">';
                body_template += '<div class="section-avatar">';
                body_template += '<img src="' + avatar_link + '" alt="">';
                body_template += '</div>';//contestant avatar closing tag
                body_template += '<div class="section-username">' +
                                    username +
                                 '</div>';//contestant username closing tag
                body_template += '</div>';//contestant badge closing tag
                body_template += '<div class="section-thumbnail-and-ratings">';
                body_template += '<div class="section-thumbnail"' +
                                 'data-video-link="' +
                                    video_link + '">' +
                                 '<div class="play-button" data-vlink="' + video_link + '"></div>' +
                                 '<img src="' +
                                    thumbnail_link +
                                 '" alt="">' +
                                 '</div>';//section thumbnail closing tag
                body_template += '<div class="section-ratings">';
                body_template += '<div class="likes-ratings">' +
                                    '<div class="like-button"></div>' +
                                    '<div class="like-count">' + likes + '</div>' +
                                 '</div>';
                body_template += '<div class="rank">Rank #' + rank + '</div>';
                body_template += '</div>';//section ratings closing tag
                body_template += '</div>';//section thumbnail and ratings closing tag
                body_template += '<div class="section-options-button-wrapper">' +
                                 '<div class="section-options-button"></div>' +
                                 '</div>';
                body_template += '</div>';//contestant section closing tag
                if (i == 0) {
                    body_template += '<div class="vs-divider">';
                    body_template += '<div>VS</div>';
                    body_template += '</div>';// vs-divider closing tag
                }
            }
        } else if (contestant_no > 2) {
            for (i = 0; i < contestant_no; i++) {
                var username = contestant_info_array[i]
                                .contestant_username;
                var avatar_link = contestant_info_array[i]
                                .avatar_link;
                var thumbnail_link = contestant_info_array[i]
                                .thumbnail_link;
                var video_link = contestant_info_array[i]
                                .video_link;
                var likes = contestant_info_array[i]
                                .likes;
                var rank = contestant_info_array[i]
                                .rank;
                body_template += '<div class="contestant-section">';
                body_template += '<div class="section-badge">';
                body_template += '<div class="section-avatar">';
                body_template += '<img src="' + avatar_link + '" alt="">';
                body_template += '</div>';//contestant avatar closing tag
                body_template += '<div class="section-username">' +
                                    username +
                                 '</div>';//contestant username closing tag
                body_template += '</div>';//contestant badge closing tag
                body_template += '<div class="section-thumbnail-and-ratings">';
                body_template += '<div class="section-thumbnail"' +
                                 'data-video-link="' +
                                    video_link + '">' +
                                 '<div class="play-button" data-vlink="' + video_link + '"></div>' +
                                 '<img src="' +
                                    thumbnail_link +
                                 '" alt="">' +
                                 '</div>';//section thumbnail closing tag
                body_template += '<div class="section-ratings">';
                body_template += '<div class="likes-ratings">' +
                                    '<div class="like-button"></div>' +
                                    '<div class="like-count">' + likes + '</div>' +
                                 '</div>';
                body_template += '<div class="rank">Rank #' + rank + '</div>';
                body_template += '</div>';//section ratings closing tag
                body_template += '</div>';//section thumbnail and ratings closing tag
                body_template += '<div class="section-options-button-wrapper">' +
                                 '<div class="section-options-button"></div>' +
                                 '</div>';
                body_template += '</div>';//contestant section closing tag   
            }
        }
        body_template += '</div>';//body closing tag
        return body_template;
    }
    function print_bracket_body(activity_data) {
        var branch_no = (activity_data.contestants_info.length / 2);
        var contestant_info_array = activity_data.contestants_info;
        var body_template = '<div class="activity-divider">Round ' + activity_data.activity_round + '</div>';
        body_template += '<div class="activity-body">';
        for (i = 1; i <= branch_no; i++) {
            body_template += '<div class="bracket-section">';
            body_template += '<div class="bracket-section-content-wrapper">';
            $.each(contestant_info_array, function (index, value) {
                if (contestant_info_array[index].branch == i) {
                    var thumbnail_link = contestant_info_array[index]
                                            .thumbnail_link;
                    var video_link = contestant_info_array[index]
                                        .video_link;
                    var username = contestant_info_array[index]
                                        .contestant_username;
                    var avatar_link = contestant_info_array[index]
                                        .avatar_link;
                    var likes = contestant_info_array[index]
                                        .likes;
                    body_template += '<div class="bracket-section-content">';
                    body_template += '<div class="bracket-section-avatar-wrapper">';
                    body_template += '<div class="bracket-section-avatar">' +
                                     '<img src="' + avatar_link + '"></div>';
                    body_template += '<div class="bracket-section-username">' + username + '</div>';
                    body_template += '</div>';//closing tag for avatar
                    body_template += '<div class="bracket-section-thumbnail">';
                    body_template += '<div class="play-button" data-vlink="' + video_link + '"></div>';
                    body_template += '<img src="' + thumbnail_link + '" alt="">';
                    body_template += '</div>';//closing tag for bracket section thumbnail
                    body_template += '<div class="bracket-section-ratings">';
                    body_template += '<div class="likes-ratings">' +
                                            '<div class="like-button"></div>' +
                                            '<div class="like-count">' + likes + '</div>' +
                                         '</div>';
                    body_template += '</div>';//closing tag for bracket section ratings
                    body_template += '<div class="bracket-section-options-button-wrapper">';
                    body_template += '<div class="bracket-section-options-button"></div>';
                    body_template += '</div>';//closing tag for bracket section options btn wrapper
                    body_template += '</div>';//closing tag for bracket section content
                }
            });
            body_template += '</div>';//closing tag for bracket section content wrapper
            body_template += '<div class="bracket-section-frame"></div>';//bracket frame
            body_template += '</div>';//closing tag for bracket section
        }
        body_template += '</div>';//closing tag of body
        return body_template;//'print bracket body';
    }
    function print_oc_challenge(activity_data) {
        var host_username = activity_data.activity_host_info.username;
        var contestant_no = activity_data.contestants_info.length;
        var contestant_info_array = activity_data.contestants_info;
        var body_template = '';

        for (i = 0; i < contestant_no; i++) {

            var username = contestant_info_array[i]
                            .contestant_username;
            var avatar_link = contestant_info_array[i]
                            .avatar_link;
            var thumbnail_link = contestant_info_array[i]
                            .thumbnail_link;
            var video_link = contestant_info_array[i]
                            .video_link;
            var likes = contestant_info_array[i]
                            .likes;
            var rank = contestant_info_array[i]
                            .rank;

            if (host_username == username) {
                body_template += '<div class="activity-divider">Challenge</div>';
                body_template += '<div class="contestant-section">';
                body_template += '<div class="section-badge">';
                body_template += '<div class="section-avatar">';
                body_template += '<img src="' + avatar_link + '" alt="">';
                body_template += '</div>';//contestant avatar closing tag
                body_template += '<div class="section-username">' +
                                    username +
                                 '</div>';//contestant username closing tag
                body_template += '</div>';//contestant badge closing tag
                body_template += '<div class="section-thumbnail-and-ratings">';
                body_template += '<div class="section-thumbnail"' +
                                 'data-video-link="' +
                                    video_link + '">' +
                                 '<div class="play-button" data-vlink="' + video_link + '"></div>' +
                                 '<img src="' +
                                    thumbnail_link +
                                 '" alt="">' +
                                 '</div>';//section thumbnail closing tag
                body_template += '<div class="section-ratings">';
                body_template += '<div class="likes-ratings">' +
                                    '<div class="like-button"></div>' +
                                    '<div class="like-count">' + likes + '</div>' +
                                 '</div>';
                body_template += '<div class="rank">Rank #' + rank + '</div>';
                body_template += '</div>';//section ratings closing tag
                body_template += '</div>';//section thumbnail and ratings closing tag
                body_template += '<div class="section-options-button-wrapper">' +
                                 '<div class="section-options-button"></div>' +
                                 '</div>';
                body_template += '</div>';//contestant section closing tag
            }
        }
        return body_template;
    }
    function print_oc_response(activity_data, limit) {
        var host_username = activity_data.activity_host_info.username;
        var contestant_no = activity_data.contestants_info.length;
        var contestant_info_array = activity_data.contestants_info;
        var id = activity_data.activity_id;
        var count = '';
        if (limit == 'default') { count = 4; } else { count == limit }
        var body_template = '';
        if (contestant_no > 1) {
            body_template += '<div class="activity-divider">Response</div>';
        }
        for (i = 0; i < contestant_no; i++) {
            var username = contestant_info_array[i]
                            .contestant_username;
            var avatar_link = contestant_info_array[i]
                            .avatar_link;
            var thumbnail_link = contestant_info_array[i]
                            .thumbnail_link;
            var video_link = contestant_info_array[i]
                            .video_link;
            var likes = contestant_info_array[i]
                            .likes;
            var rank = contestant_info_array[i]
                            .rank;
            if (host_username != username) {
                body_template += '<div class="contestant-section">';
                body_template += '<div class="section-badge">';
                body_template += '<div class="section-avatar">';
                body_template += '<img src="' + avatar_link + '" alt="">';
                body_template += '</div>';//contestant avatar closing tag
                body_template += '<div class="section-username">' +
                                    username +
                                 '</div>';//contestant username closing tag
                body_template += '</div>';//contestant badge closing tag
                body_template += '<div class="section-thumbnail-and-ratings">';
                body_template += '<div class="section-thumbnail"' +
                                 'data-video-link="' +
                                    video_link + '">' +
                                 '<div class="play-button" data-vlink="' + video_link + '"></div>' +
                                 '<img src="' +
                                    thumbnail_link +
                                 '" alt="">' +
                                 '</div>';//section thumbnail closing tag
                body_template += '<div class="section-ratings">';
                body_template += '<div class="likes-ratings">' +
                                    '<div class="like-button"></div>' +
                                    '<div class="like-count">' + likes + '</div>' +
                                 '</div>';
                body_template += '<div class="rank">Rank #' + rank + '</div>';
                body_template += '</div>';//section ratings closing tag
                body_template += '</div>';//section thumbnail and ratings closing tag
                body_template += '<div class="section-options-button-wrapper">' +
                                 '<div class="section-options-button"></div>' +
                                 '</div>';
                body_template += '</div>';//contestant section closing tag
                if (i == count) {
                    body_template += '<div class="view-more-responses" data-count="' + count + '" data-id="' + id + '">View More</div>';
                    break;
                }
            }
        }
        return body_template;
    }
    function load_more_responses(obj) {
        $('.view-more-responses').unbind('click').on('click', function (e) {
            $(this).html('loading...');
            var count = $(this).attr('data-count');
            var x = $(this).attr('data-id');
            var newlimit = parseInt(count) + 1;
            var div = $(this).parents('.oc_response_wrapper');
            //var responses = print_oc_response(obj[x], newlimit, x);
            //$(this).parents('.oc_response_wrapper').html(responses);
            //load_more_responses(obj);
            ajax_query().done(function (data) {
                console.log(data);
                var obj = JSON.parse(data);
                var content = '';
                $.each(obj, function (index, value) {
                    if (value.activity_id == x) {
                        content += print_oc_response(value, 5);
                        //content += print_activity(value, newlimit);
                    }
                });
                div.html(content);
                //$('.search-page-content').html(content).css({'margin':'auto'});
                load_more_responses(obj);
            })
        });
    }
    function print_open_challenge_body(activity_data) {
        var body_template = '<div class="activity-body">';
        body_template += '<div class="oc_challenge_wrapper">';
        body_template += print_oc_challenge(activity_data);
        body_template += '</div>';
        body_template += '<div class="oc_response_wrapper">';
        body_template += print_oc_response(activity_data, 'default');
        body_template += '</div>';
        body_template += '</div>';
        return body_template;//return open challenge body
    }
    function print_activity(activity_data) {
        var id = activity_data.activity_id;
        var title = activity_data.activity_title;
        var host = activity_data.activity_host_info.username;
        var date = activity_data.activity_date;
        var activity_type = activity_data.activity_type;
        var status = activity_data.activity_status;
        var category = activity_data.activity_category;
        var contestants_no = activity_data.contestants_info.length;
        var contestant_info_array = activity_data.contestants_info;
        if (activity_type == 'performance/exhibition') {
            var activity = '<div class="activity-wrapper">';
            activity += print_header(activity_data);
            activity += print_exhibition_body(activity_data);
            activity += print_footer(activity_data);
            activity += '</div>';
            return activity;
        } else if (activity_type == 'battle') {
            var activity = '<div class="activity-wrapper">';
            activity += print_header(activity_data);
            activity += print_battle_body(activity_data);
            activity += print_footer(activity_data);
            activity += '</div>';
            return activity;
        } else if (activity_type == 'bracket') {
            var activity = '<div class="activity-wrapper">';
            activity += print_header(activity_data);
            activity += print_bracket_body(activity_data);
            activity += print_footer(activity_data);
            activity += '</div>';
            return activity;
        } else if (activity_type == 'open challenge') {
            var activity = '<div class="activity-wrapper">';
            activity += print_header(activity_data);
            activity += print_open_challenge_body(activity_data);
            activity += print_footer(activity_data);
            activity += '</div>';
            return activity;
        }


    }
    function play_video() {
        $('.play-button').on('click', function (e) {
            var vlink = $(this).attr('data-vlink');
            var iframe = document.createElement('iframe');
            iframe.src = 'http://www.bracketdash.com/video/video_player.php?link=' + vlink;
            $(iframe).attr('id', 'iframe');
            $(iframe).attr('allowfullscreen', '');
            $(iframe).attr('frameBorder', 0);
            $(iframe).css({ 'margin': '0', 'padding': '0', 'border': 'none', 'display': 'block' });
            $("#explore-iframe").html(iframe).enhanceWithin().popup("open");
            $('#explore-iframe').on("popupafterclose", function (e) {
                iframe.remove();
                $(this).empty();
            });
        });
    }
    function play_demo_video() {
        $('.play-button').on('click', function (e) {
            var vlink = $(this).attr('data-vlink');
            var iframe = document.createElement('iframe');
            iframe.src = vlink;
            $(iframe).attr('id', 'iframe');
            $(iframe).attr('allowfullscreen', 'true');
            $("#demo-iframe").html(iframe).enhanceWithin().popup("open");
            $('#demo-iframe').on("popupafterclose", function (e) {
                iframe.remove();
                $(this).empty();
            });
        });
    }
    function badPractice() {
        var $body = angular.element(document.body);   // 1
        //var $rootScope = $body.scope().$root;         // 2
        alert('');
        $body.scope().$apply();


    }
    function getfeed() {
        $.ajax({
            type: 'POST',
            url: "http://www.bracketdash.com/demo.php",
            crossDomain: true,
            data: { panel: 'ok' },
            success: function (data) {
                //console.log(data);
                try {
                    var json_obj = JSON.parse(data);
                    console.log(json_obj);
                    //alert(JSON.stringify(json_obj));
                    var obj = json_obj.obj;
                    console.log(obj);
                    var content = '';
                    $.each(obj, function (index, value) {
                        content += print_activity(value);
                    });
                    $('.demo-content').html(content);//.enhanceWithin().css({ 'margin-top': '10px' });
                    play_demo_video();
                } catch (e) { alert(e); }

            },
            error: function (data) { alert(JSON.stringify(data)); }
        });
    }

    



    var AngularHelper = (function () {
        var AngularHelper = function () { };

        /**
         * ApplicationName : Default application name for the helper
         */
        var defaultApplicationName = "app";

        /**
         * Compile : Compile html with the rootScope of an application
         *  and replace the content of a target element with the compiled html
         * @$targetDom : The dom in which the compiled html should be placed
         * @htmlToCompile : The html to compile using angular
         * @applicationName : (Optionnal) The name of the application (use the default one if empty)
         */
        AngularHelper.Compile = function ($targetDom, htmlToCompile, applicationName) {
            var $injector = angular.injector(["ng", applicationName || defaultApplicationName]);

            $injector.invoke(["$compile", "$rootScope", function ($compile, $rootScope) {
                //Get the scope of the target, use the rootScope if it does not exists
                var $scope = $targetDom.html(htmlToCompile).scope();
                $compile($targetDom)($scope || $rootScope);
                $rootScope.$digest();
            }]);
        }

        return AngularHelper;
    })();