//document ready, retrieves posts from server and appends them to a div
$(function() {

    //gets data from login/register form
    /* function registerUser() {*/


    $('#register').click(function(event) {
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
            $('.bg-image').toggleClass('toggle');
            $('.container-header').hide();
            $('.container-login-register').hide();
            $('.container-user-post-results').show();

            /*alert(response.message);*/
        }).fail(function(response) {
            console.log("some error message");
            /*alert(response.message);*/
        });


    })


    $('#login').click(function(event) {
        event.preventDefault();
        var email = $('#email').val();
        var password = $('#password').val();
        $.ajax({
            url: '/login',
            method: 'POST',
            data: {
                username: email,
                password: password,
                /*token: myToken*/
            }
        }).done(function(response) {
             $('#bg-image').toggleClass('toggleClass');
            $('.container-header').hide();
            $('.container-login-register').hide();
            $('.container-user-post-results').show();
            console.log(response);
        }).fail(function(response) {
            console.log(response);
        });
    });

    /*}*/



    //jquery actions for button clicks in register and login

    /*   $('.login-register').submit(function(event) {
        var create_user ={
            email: $('#email').val(),
            password: $('#password').val()
        }
        var user_login = {
            email: $('#email').val(),
            password: $('#password').val()
        }
        addData(data);
        $('#register').click(function(data) {
            create_user;
        });
    }
*/


    //New Post Button On Click
    $("#new").click(function() {
        // assumes element with id='button'
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

    $.getJSON('/posts', function(data) {

        $.each(data.posts, function(i, data) {
            var div_data =
                '<div><img src="' + data.image + '"><br/>' + data.title + "<br/>" + data.recordstore + "<br/>" + data.description + "<br/>" + data.user + "<br/>" + data.created + '<br/><button id="' + data.id + '" type="button" class="btn-delete btn-secondary btn-xs">Delete</button></div>';

            var $items = $('<div class="col-md-4"></div');
            $items.append(div_data)

            $('.row').append($items);

        });

    });

    //delete posts
    $('body').on('click', '.btn-delete', function(event) {

        event.preventDefault();
        var self = $(this);
        jQuery.ajax({
            url: '/posts/' + this.id,
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
        console.log(data, 'data')

        $.ajax({
            url: '/posts',
            method: 'POST',
            // contentType: 'application/json; charset=utf-8', // not too necessary
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
