//document ready, retrieves posts from server and appends them to a div
$(function() {
    $.getJSON('/posts', function(data) {


        $.each(data.posts, function(i, data) {

            var div_data =
                "<div>" + data.title + "<br/>" + data.recordstore + "<br/>" + data.description + "<br/>" + data.user + "<br/>  <p class='date'>" + data.created + "</div>";


            //append data to new div
            var $items = $('<div class="grid-item"></div>');





            $('.grid').prepend($items);
            $('.grid-item').append(div_data);



            // $grid.masonry('reloadItems')

            // add and lay out newly prepended items
            //.masonry('prepended', $items);

        });




        // init Isotope
        var $grid = $('.grid-item').isotope({
            getSortData: {
                created: '[.date]',
                dated: function(itemElem) {
                        var dated = $(itemElem).find('.date');
                        return dated;
                    } // text from querySelector

            }
        });


        //search with isotope by class in my html to locate the date and filter by last added
        $grid.isotope({ sortAscending: false, dated: true });


    });


    //this creates a new post on submit from user-posts form.
    $("#user-posts").submit(function(event) {
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
                    '<div class="grid-item" style="position: relative; height: 132px;">' + responseData.title + "<br/> " + responseData.recordstore + "<br/>" + responseData.description + "<br/>" + responseData.user + "<br/>" + responseData.created + "</div>";

                $('.grid').prepend(div_data);
            },
            error: function(jqXHR, status) {
                console.log(jqXHR);
                alert('fail' + status.code);
            }
        });
    }


});
