$(function() {

    // once user is logged in
    let myToken = localStorage.getItem('token');

    if (myToken) {
        $('.bg-image').toggleClass('toggle');
        $('.container-header').hide();
        $('.container-login-register').hide();
        $('.container-user-post-results').show();

        $.getJSON('/posts?token=' + myToken, function(data) {

            $.each(data.posts, function(i, data) {
                var div_data =
                    '<div><img src="' + data.image + '"><br/>' + data.title + "<br/>" + data.recordstore + "<br/>" + data.description + "<br/>" + data.user + "<br/>" + data.created + '<br/><button id="' + data.id + '" type="button" class="btn-delete btn-danger btn-secondary btn-xs">Delete</button></div>';

                var $items = $('<div class="col-md-4"></div');
                $items.append(div_data)

                $('.row').append($items);

            });

        });
    } else {

        /* $('.bg-image').toggleClass('toggle');*/
        $('.container-header').show();
        $('.container-login-register').show();
        $('#logout-top').hide();
        $('#new-top').hide();
    }

    // on user logout
    $('#logout-top').click(function(event) {
        event.preventDefault();
        $('.bg-image').show();
        $('.container-header').show();
        $('.container-login-register').show();
        $('.container-user-post-results').hide();
        location.reload();
        localStorage.clear();

    })

    // if not looged in and not a user yet
    $('.register-button').click(function(event) {
        event.preventDefault();
        var email = $('#email').val();
        var password = $('#password').val();
        $.ajax({
            url: '/register',
            method: 'POST',
            data: {
                email: email,
                password: password
            }
        }).done(function(response) {
            $('.bg-image').hide();
            $('.container-header').hide();
            $('.container-login-register').hide();
            $('.container-user-post-results').show();
             localStorage.setItem('token', response.token)
            location.reload();

        }).fail(function(response) {
            console.log(response);

        });


    });

    // on user login
    $('#login').click(function(event) {
        event.preventDefault();
        var email = $('#email').val();
        var password = $('#password').val();
        $.ajax({
            url: '/login',
            method: 'POST',
            data: {
                email: email,
                password: password
            }
        }).done(function(response) {

            $('.bg-image').hide();
            $('.container-header').hide();
            $('.container-login-register').hide();
            $('.container-user-post-results').show();
            
            localStorage.setItem('token', response.token)
            location.reload();

        }).fail(function(response) {
            console.log(response);
        });
    });


    //New Post Button On Click
    $("#new-top").click(function() {
        $('.container-user-upload-new-post').show();
        $('.container-user-post-results').hide();

        //New Form Post
        $('.form-post').submit(function(event) {
            event.preventDefault();
            $('.container-user-upload-new-post').hide();
            $('.container-user-post-results').show();
            var data = {
                image: $('#url').data('url'),
                user: $('#user').val(),
                title: $('#title').val(),
                description: $('#description').val(),
                recordstore: $('#recordstore').val()
            }

            addData(data);
            $('.form-post')[0].reset();
            location.reload();

        });
    });

    //delete posts
    $('body').on('click', '.btn-delete', function(event) {

        event.preventDefault();
        var self = $(this);
        jQuery.ajax({
            url: '/postsposts?token=/' + this.id,
            type: 'DELETE',
            success: function(data) {
                // this has "function" connotations
                console.log(this, self);
                self.parent().parent().remove();

            }
        });
    })

    //this creates a new post on submit from user-posts form.
    $('#uploaded').unsigned_cloudinary_upload('k9gdegt1', { cloud_name: 'dbkrpg9qe' }, { multiple: true })
        .bind('cloudinarydone', function(e, data) {

            var version = data.result.version;
            var public_id = data.result.public_id;
            var imageUrl = "http://res.cloudinary.com/dbkrpg9qe/image/upload/v" + version + "/" + public_id + ".png";


            $('#url').data('url', imageUrl);
            console.log(imageUrl);
        });

    //sends data from post to server
    function addData(data) {
        $.ajax({
            url: '/posts?token=' + myToken,
            method: 'POST',
            data: data,

            success: function(responseData, status, jqXHR) {
                console.log(responseData);

                var div_data =
                    '<div class="col-md-4"><img src="' + responseData.image + '"><br/>' + responseData.title + "<br/> " + responseData.recordstore + "<br/>" + responseData.description + "<br/>" + responseData.user + "<br/>" + responseData.created + "</div>";

                $('.row').append(div_data);
            },
            error: function(jqXHR, status) {
                console.log(jqXHR);
                alert('fail' + status.code);
            }
        });
    }

});
