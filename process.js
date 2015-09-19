

function process(str, cb){
  var $ = jQuery;
  var html = $('<div></div>').append(str);
  var $threads = html.find('.thread');

  var threads = $threads.get().map(function($thread){
    $thread = $($thread)
    var messages = $($thread.find('.message'));
    var people = $(messages[0].previousSibling).text().split(', ');
    thread = {
      people: people,
    };
    thread.messages = messages.get().map(function($message){
      $message = $($message);
      var user = $($message.find('.user')).text();
      var meta = $($message.find('.meta')).text();
      var content = $($message[0].nextSibling).text();

      //'Wednesday, December 19, 2012 at 12:28pm PST'
      date = moment(meta, 'dddd, MMMM D, YYYY at h:mmA z');

      return {
        user: user,
        date: date.toISOString(),
        content: content
      };
    });
    return thread;
  });
  if (threads.length == 0)
    cb('no threads');
  else
    cb(null, threads)
}
