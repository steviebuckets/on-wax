$(function() {
    $.getJSON('/posts', function(data) {


        $.each(data.posts, function(i, data) {

            var div_data =
                "<div>" + data.title + " <br/> " + data.recordstore + "<br/> " + data.description + "<br/>" + data.user + "<br/>" + data.created + " </div>";


            $(div_data).appendTo('#posts').before("<br/>");
        });

        //console.log(data);

    });

});

function addData(data) {
    $.ajax({
        url: 'http://localhost:8080/posts',
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        success: function(data, status, jqXHR) {
            console.log(status);


        },
        error: function(jqXHR, status) {
            console.log(jqXHR);
            alert('fail' + status.code);
        }
    });
}

var form = document.getElementById("user-post");

form.addEventListener('submit', function() {
    var data = {};

    for (var i = 0, ii = form.length; i < ii; ++i) {
        var input = form[i];
        if (input.name) {
            data[input.name] = input.value;
        }
    }
    addData(data);
})




console.log(document);
$(function() {
    function addData(data) {
        $.ajax({
            url: 'http://localhost:8080/posts',
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            success: function(responseData, status, jqXHR) {
                console.log(responseData);
            },
            error: function(jqXHR, status) {
                console.log(jqXHR);
                alert('fail' + status.code);
            }
        });
    }

})
