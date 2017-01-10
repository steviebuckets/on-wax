//document ready, retrieves posts from server and appends them to a div
$(function() {
    $.getJSON('/posts', function(data) {

        

        $.each(data.posts, function(i, data) {
            var div_data =
                "<div>" + '<p class="title">' + data.title + "</p><br/>" + data.recordstore + "<br/>" + data.description + "<br/>" + data.user + "<br/> <p class='date'>" + data.created + "</div>";

           var $items = $('<div class="col-md-4"></div');
            $items.append(div_data)
            
            $('.row').append($items);
                

        });


      


    });


    //this creates a new post on submit from user-posts form.
    $('.form-group').submit(function(event) {
        event.preventDefault();
        var data = {
            user: $('#user').val(),
            title: $('#title').val(),
            description: $('#description').val(),
            recordstore: $('#recordstore').val()
        }

        addData(data);
        $('.form-group')[0].reset();

    });

    //sends data from post to server
    function addData(data) {

        $.ajax({
            url: '/posts',
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            success: function(responseData, status, jqXHR) {
                console.log(responseData);

                var div_data =
                    '<div class="col-6 col-md-4">' + responseData.title + "<br/> " + responseData.recordstore + "<br/>" + responseData.description + "<br/>" + responseData.user + "<br/>" + responseData.created + "</div>";

                $('.grid').append(div_data);
            },
            error: function(jqXHR, status) {
                console.log(jqXHR);
                alert('fail' + status.code);
            }
        });
    }


});
