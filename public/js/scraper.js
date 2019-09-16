$(document).ready(function () {

  //Adding click handler for scraperLink - this will call the API for the data.
  $(".scraperLink").click(function (e) {
    e.preventDefault()
    return $.ajax({
      type: "GET",
      url: "/scrape",
    }).then(function (data) {})
  })

  $.ajax({
    type: "GET",
    url: "/showscraped"
  }).then(function(data) {
    //console.log(data)
  })

  //Adding a post request in order to update the saved value in each article object...
  $(".saveButton").click(function () {
    let id = $(this).attr("id")

    return $.ajax({
      type: "POST",
      url: "/saved/" + id,
      id: id,
      data: {
        saved: true
      }
    }).then($(this).closest(".card").remove())
  })

  //Adding a post route in order to delete the article from the DB
  $(".deleteArticle").click(function () {
    let id = $(this).attr("id")

    return $.ajax({
      type: "PUT",
      url: "/articles/delete/" + id,
      id: id
    }).then($(this).closest(".card").remove())
  })
})

//Adding onclick to display modal with the appropriate attributes
$(".addNote").click(function () {
  let articleId = $(this).attr("id")
  $(".submitNote").attr("articleId", articleId)
  $(".notesModalBackground").css("display", "grid")
  console.log(articleId)
});

//Adding onclick to save the note to it's respective article in the DB.
$(".submitNote").click(function () {
  let id = $(this).attr("articleId")
  let title = $(".notesTitle").val().trim()
  let body = $(".notesText").val().trim()
  console.log(`Notes Body: ${body}`)
  return $.ajax({
    type: "POST",
    url: "/articles/note/" + id,
    id: id,
    data: {
      title: title,
      body: body
    }
  }).then(function (data) {
    location.reload()
  })
})

//Adding onclick to delete the note from its article
$(".deleteNote").click(function () {
  let id = $(this).attr("id")

  return $.ajax({
    type: "PUT",
    url: "/articles/note/" + id
  }).then(function (data) {
    location.reload()
  })
})