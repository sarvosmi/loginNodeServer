
function authLogs(db,params)
{
    return addLoginLogs(db,params);

}
module.exports=authLogs


function addLoginLogs(db,params)
{  
    db.query(
        'INSERT INTO login_logs(userid, action, action_timestamp,action_status) VALUES(?,?,?,?)',
        [params.id, params.action, new Date(),params.action_status],        
        (error) => {
          if (error) {            
            return 0;
          } else {
            return 1;
          }
        }
      );
}

