exports.getUserPublicData = (data) => {

    return {
        _id: data._id,
        role: data.role,
        dataname: data.dataname,
        verified: data.verified,
        name: data.name,
        family: data.family,
        fullname: data.fullname,
        image: data.image,
        username: data.username,
        description: data.description


    }
};


exports.getAppletPublicData = (data) => {

    return {
        name: data.name,
        description: data.description,
        image: data.image,
        verified: data.verified,

    }
};