//document ready, retrieves posts from server and appends them to a div
$(function() {
    $.getJSON('/posts', function(data) {

        $.each(data.posts, function(i, data) {
            var div_data =
                "<div>" + data.title + "<br/>" + data.recordstore + "<br/>" + data.description + "<br/>" + data.user + "<br/>" + data.created + "<br/> <p class='tag' data-id=['_id']> + data.id + </p>" +"<br/>" + '<button type="button" class="btn btn-secondary btn-xs">Delete</button>' + "</div>";

            var $items = $('<div class="col-md-4"></div');
            $items.append(div_data)

            $('.row').append($items);
             $('.btn').click(delete_post);

        });

        //deletes post
        
           
   
    });

//delete post function
function delete_post() {
    var id = $(this).attr('data-id');
    jQuery.ajax({
        url: '/posts',
        id: this._id,
        type: 'DELETE',
        success: function(data) {
            show_items();
        }
    });
}



    //this creates a new post on submit from user-posts form.
    $('.form-inline').submit(function(event) {
        event.preventDefault();
        var data = {
            user: $('#user').val(),
            title: $('#title').val(),
            description: $('#description').val(),
            recordstore: $('#recordstore').val()
        }

        addData(data);
        $('.form-inline')[0].reset();
          location.reload();


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
                    '<div class="col-md-4">' + responseData.title + "<br/> " + responseData.recordstore + "<br/>" + responseData.description + "<br/>" + responseData.user + "<br/>" + responseData.created + "</div>";

                $('.row').append(div_data);
            },
            error: function(jqXHR, status) {
                console.log(jqXHR);
                alert('fail' + status.code);
            }
        });
    }


});
