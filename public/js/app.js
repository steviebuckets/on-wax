$(function() {

    // once user is logged in
    let myToken = localStorage.getItem('token');

    if (myToken) {
        /* $('.bg-image').toggleClass('toggle');*/
        $('.jumbotron').hide();
        $('.section-2').hide();
        $('.container-login-register').hide();
        $('.container-user-post-results').show();


        $.getJSON('/posts?token=' + myToken, function(data) {



            $.each(data.posts, function(i, data) {
                var div_data =
                    '<div><img src="' + data.image + '"><br/>' + data.title + "<br/>" + data.recordstore + "<br/>" + data.description + "<br/>" + data.user + "<br/>" + data.created + '<br/><button id="' + data.id + '" type="button" class="btn-delete btn-danger btn-secondary btn-xs">Delete</button> <br/><br/><button id="' + data.id + '" type="button" class="btn-edit btn-primary btn-secondary btn-xs">Edit</button></div>';

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
            console.log(response);
            $('.bg-image').hide();
            $('.container-header').hide();
            $('.container-login-register').hide();
            $('.container-user-post-results').show();

            localStorage.setItem('token', response.token);
            location.reload();

        }).fail(function(response) {
            console.log(response);
        });
    });


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

            localStorage.setItem('token', response.token);
            location.reload();

        }).fail(function(response) {
            $('.alert').removeClass('hidden');
            console.log(response);
            /* location.reload();*/

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
            // /blah/blah/dah query string!!! ?key=value
            url: '/posts/' + this.id + '?token=' + myToken || localStorage.getItem('token'),
            type: 'DELETE',
            success: function(data) {
                // this has "function" connotations
                console.log(this, self);
                self.parent().parent().remove();


            }
        });
    })


    //edit posts
    $('body').on('click', '.btn-edit', function(event) {
        // $('#url').data('edit-url') // more code review// 
        // Prepopulate the form fields.
        var self = this;
        console.log(self.id);
        jQuery.ajax({
            //this route works but returns an error, something went awry
            url: '/posts/' + self.id + '?token=' + myToken || localStorage.getItem('token'),
            //this code returns no error but does not pre-fill form with data from orginal post
            /*url: '/posts?token=' + myToken + this.id || localStorage.getItem('token'),*/
            type: 'GET',
            success: function(data) {
                $('#edit-user').val(data.user);
                $('#edit-title').val(data.title);
                $('#edit-description').val(data.description);
                $('#edit-recordstore').val(data.recordstore);
                $('#image-preview').attr('src', data.image);
                // store the id here as an HTML 5 Data attribute!!!!
                $('#edit-post').data('id', self.id);
            }
        });

        // end of prepopulate

        // hide other stuff
        $('.container-user-edit-post').show();
        $('.container-user-post-results').hide();
    });

    $('body').on('submit', '.edit-post', function(event) {
        event.preventDefault();
        var self = this;
        console.log(this.id);
        var url = '/posts/' + $('.edit-post').data('id') + '?token=' + myToken || localStorage.getItem('token');
        console.log(url);
        jQuery.ajax({
            url: url,
            type: 'PUT',
            data: {
                image: $('#edit-url').data('edit-url'),
                user: $('#edit-user').val(),
                title: $('#edit-title').val(),
                description: $('#edit-description').val(),
                recordstore: $('#edit-recordstore').val()
            },
            success: function(data) {
                $('.container-user-edit-post').hide();
                $('.container-user-post-results').show();
                $('.edit-post')[0].reset();
                location.reload();
            }
        });
    });





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


    //Update posts - image
    $('#edit-uploaded').unsigned_cloudinary_upload('k9gdegt1', { cloud_name: 'dbkrpg9qe' }, { multiple: true })
        .bind('cloudinarydone', function(e, data) {

            var version = data.result.version;
            var public_id = data.result.public_id;
            var imageUrl = "http://res.cloudinary.com/dbkrpg9qe/image/upload/v" + version + "/" + public_id + ".png";


            $('#edit-url').data('edit-url', imageUrl);
            $('#image-preview').attr('src', imageUrl);
            console.log(imageUrl);
        });

    //Update posts - sends data from post to server
    /*function editAddData(data) {
        $.ajax({
            url: '/posts?token=' + myToken,

            method: 'PUT',
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
    }*/

});
