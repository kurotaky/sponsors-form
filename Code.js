// Rails Girls Tシャツスポンサーの受付フォーム
//
// formからsubmitすると指定したリポジトリにGitHub issueを作ります

const properties = PropertiesService.getScriptProperties()

const GITHUB_ACCESS_TOKEN = properties.getProperty('GITHUB_ACCESS_TOKEN')
const GITHUB_ENDPOINT = properties.getProperty('GITHUB_ENDPOINT')
const GITHUB_REPOSITORY_ID = properties.getProperty('GITHUB_REPOSITORY_ID')

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
  var mutation = 'mutation {\
    createIssue(input:{repositoryId:"'+GITHUB_REPOSITORY_ID+'", title:"'+title+'", body:"'+formattedBody+'"}) {\
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
      'Authorization' : 'Bearer ' + GITHUB_ACCESS_TOKEN,
      'Accept' : 'application/json',
     },
    'payload' : JSON.stringify({query:mutation})
  };
  var response = UrlFetchApp.fetch(GITHUB_ENDPOINT, options);
  var json = JSON.parse(response.getContentText());

  Logger.log(json);

  return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(ContentService.MimeType.JSON);
}
