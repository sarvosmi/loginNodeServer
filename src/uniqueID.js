
const { randomUUID } = require('crypto');

function getUniqueID()
{
    //console.log(randomUUID())
    return randomUUID()    
}

module.exports=getUniqueID