// Rails Girls Tシャツスポンサーの受付フォーム
//
// formからsubmitすると指定したリポジトリにGitHub issueを作ります

var properties = PropertiesService.getScriptProperties()

function onSubmit(event) {
  var itemResponses = event.response.getItemResponses();
  var bodyArray = [];

  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    bodyArray.push(["## " + itemResponse.getItem().getTitle() + "\n\n" + itemResponse.getResponse() + "\n\n"]);
  }

  // itemResponses[1]が日付
  var dateString = Utilities.formatDate(new Date(itemResponses[1].getResponse()), "JST", "yyyy年MM月dd日");

  // issue titleは日付+イベント名
  var title = dateString + " " + itemResponses[0].getResponse();
  var formattedBody = bodyArray.join("")

  createGitHubIssue(title, formattedBody)
}

function createGitHubIssue(title, formattedBody) {
  var token = properties.getProperty('GITHUB_ACCESS_TOKEN')
  var endpoint = properties.getProperty('GITHUB_ENDPOINT')
  var repositoryId = properties.getProperty('GITHUB_REPOSITORY_ID')

  var mutation = 'mutation {\
    createIssue(input:{repositoryId:"'+repositoryId+'", title:"'+title+'", body:"'+formattedBody+'"}) {\
      issue {\
        title,\
        url\
      }\
    }\
  }';

  var options = {
    'method' : 'post',
    'contentType' : 'application/json',
    'headers' : {
      'Authorization' : 'Bearer ' + token,
      'Accept' : 'application/json',
     },
    'payload' : JSON.stringify({query:mutation})
  };
  var response = UrlFetchApp.fetch(endpoint, options);
  var json = JSON.parse(response.getContentText());

  Logger.log(json);

  return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(ContentService.MimeType.JSON);
}
