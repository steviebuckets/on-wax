//document ready, retrieves posts from server and appends them to a div
$(function() {
    $.getJSON('/posts', function(data) {
        $.each(data.posts, function(i, data) {

            var $grid = $('.grid').masonry({
                columnWidth: 200,
                itemSelector: '.grid-item'
            });


            var $items = $('<div class="grid-item"></div>');
            // prepend items to grid
            $('.grid').prepend($items)
                // add and lay out newly prepended items
                .masonry('prepended', $items);

            var div_data =
                "<div>" + data.title + "<br/> " + data.recordstore + "<br/>" + data.description + "<br/>" + data.user + "<br/>" + data.created + "</div>";

            $items.append(div_data);




            // $('.grid-item').append(div_data);

            /*var $grid = $('.grid').masonry({
                 columnWidth: 160,
                 itemSelector: '.grid-item'
             });

             $grid.prepend(div_data).masonry('prepended', div_data);*/

            // create <div class="grid-item"></div>



        });


    });


    //this creates a new post on submit from user-posts form.
    $("#user-post").submit(function(event) {
        event.preventDefault();
        var data = {
            user: $('#user').val(),
            title: $('#title').val(),
            description: $('#description').val(),
            recordstore: $('#recordstore').val()
        }

        addData(data);
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
                    "<div>" + responseData.title + "<br/> " + responseData.recordstore + "<br/>" + responseData.description + "<br/>" + responseData.user + "<br/>" + responseData.created + "</div>";

                $('.user-posts').append(div_data);
            },
            error: function(jqXHR, status) {
                console.log(jqXHR);
                alert('fail' + status.code);
            }
        });
    }


});
