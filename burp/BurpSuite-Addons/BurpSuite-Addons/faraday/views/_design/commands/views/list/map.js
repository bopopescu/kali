// Faraday Penetration Test IDE - Community Version
// // Copyright (C) 2013  Infobyte LLC (http://www.infobytesec.com/)
// // See the file 'doc/LICENSE' for the license information
function(doc) {
    if(doc.type=="CommandRunInformation"){
        kk = doc.command + " " + doc.params;
        emit(kk, [doc.itime, doc.duration] );
    }
}

