$(function() {

    // once user is logged in
    let myToken = localStorage.getItem('token');

    if (myToken) {
        $('.jumbotron').hide();
        $('.section-2').hide();
        $('.container-login-register').hide();
        $('.container-user-post-results').show();

  

        $.getJSON('/posts?token=' + myToken, function(data) {



            $.each(data, function(i, data) {
                var d = new Date();

                var div_data =
                    '<div><img class="on-hover" src="' + data.image + '"><br/> <p class="image-posts">' + data.artist + "<br/>" + data.title + "<br/>" + data.recordstore + "<br/>" + d.toDateString() + '<br/><button id="' + data._id + '" type="button" s class="btn-delete btn-link">Delete</button><br/><button id="' + data._id + '" type="button" class="btn-edit btn-link">Edit</button></p></div>';

                var $items = $('<div class="col-md-12"></div');
                $items.append(div_data)

                $('.row').append($items);
            });

        });
    } else {

        $('.navbar').hide();
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
            $('.alert-login').removeClass('hidden');
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

        });


    });



    //New Post Button On Click
    $("#new-top").click(function() {
        $('.container-user-upload-new-post').show();
        $('.col-md-12').hide();

        //New Form Post
        $('.form-post').submit(function(event) {
            event.preventDefault();
            $('.container-user-upload-new-post').hide();
            $('.container-user-post-results').show();

            var data = {
                image: $('#url').data('url'),
                user: $('#user').val(),
                title: $('#title').val(),
                artist: $('#artist').val(),
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
            url: '/posts/' + this.id + '?token=' + myToken || localStorage.getItem('token'),
            type: 'DELETE',
            success: function(data) {
                console.log(this, self);
                self.parent().parent().remove();
                location.reload();


            }
        });
    })


    //edit posts
    $('body').on('click', '.btn-edit', function(event) {
        $('#url').data('edit-url');
        // Prepopulate the form fields.
        var self = this;
        jQuery.ajax({
            url: '/posts/' + self.id + '?token=' + myToken || localStorage.getItem('token'),
            type: 'GET',
            success: function(data) {
                $('#edit-artist').val(data.artist);
                $('#edit-title').val(data.title);
                $('#edit-recordstore').val(data.recordstore);
                $('#image-preview').attr('src', data.image);
                $('#edit-post').data('id', self.id);
            }
        });

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
                title: $('#edit-title').val(),
                artist: $('#edit-artist').val(),
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
            var imageUrl = "res.cloudinary.com/dbkrpg9qe/image/upload/v" + version + "/" + public_id + ".png";


            $('#url').data('url', imageUrl);
            $('#image-preview-post').attr('src', imageUrl);
            $('#uploaded').hide();
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
                
                alert('fail' + status.code);
            }
        });
    }


    //Update posts - image
    $('#edit-uploaded').unsigned_cloudinary_upload('k9gdegt1', { cloud_name: 'dbkrpg9qe' }, { multiple: true })
        .bind('cloudinarydone', function(e, data) {

            var version = data.result.version;
            var public_id = data.result.public_id;
            var imageUrl = res.cloudinary.com/dbkrpg9qe/image/upload/v" + version + "/" + public_id + ".png";


            $('#edit-url').data('edit-url', imageUrl);
            $('#image-preview').attr('src', imageUrl);
            $('#edit-uploaded').hide();
        });

});
