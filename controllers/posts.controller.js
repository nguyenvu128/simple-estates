const mongoose = require('mongoose');
const postModel = require('../models/post.model');
const HttpStatus = require('http-status-codes');


const extracQueryObject = (str, res) => {
    const fields = ["city", "district", "ward", "street"];
    let {projectId, postType, vipPostType} = str;
    let query = {};
    fields.forEach(f => {
        if(str[f]){
            query[f] = str[f];
        }
    })
    if(projectId){
        if(projectId.length !== 24){
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Input data not match'
            });
        }
        query.projectId = projectId;
    }
    const postTypeIds = ['1', '2', '3', '4', '5', '6', '7', '8'];
    if(postType){
        if(postTypeIds.indexOf(postType) === -1){
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Input data not match'
            });
        }
        query.postType = parseInt(postType);
    }
    const vipTypeSNumber = ['0', '1', '2', '3', '4'];
    if(vipPostType){
        if(vipTypeSNumber.indexOf(vipPostType) === -1){
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Input data not match'
            });
        }
        query.vipPostType = parseInt(vipPostType);
    }
    return query;
};
const extracSortObject = (str) => {
    const POST_COLUMNS = ["title", "price", "priceUnit", "area",
        "areaUnit", "introduce", "images", "address",
        "url", "bedrooms", "toilets", "code",
        "vipPostType", "postedAt", "slug"];
    let {sortBy, sortDirection} = str;
    if(!sortBy){
        sortBy = "vipPostType";
    }else {
        if(POST_COLUMNS.indexOf(sortBy) === -1){
            sortBy = "vipPostType";
        }
    }
    if(!sortDirection){
        sortDirection = "desc";
    }else {
        if(["asc", "desc"].indexOf(sortDirection) === -1){
            sortDirection = "desc";
        }
    }
    const sortObj = {};
    sortObj[sortBy] = sortDirection === "desc" ? -1 : 1;
    return sortObj;

}
const extractPagination = (str) => {
    let {limit, page} = str;
    if(!/[0-9]+/.test(limit)){
        limit = 10;
    }else {
        limit = parseInt(limit);
    }
    if(!/[0-9]+/.test(page)){
        page = 0;
    }else {
        page = parseInt(page);
    }
    return {limit, page};
};
const getListPosts = async (req, res) => {
  try{
      const {limit, page} = extractPagination(req.query);
      const query = extracQueryObject(req.query);
      const sortObj = extracSortObject(req.query);
      const post = await postModel.find(query)
          .skip(page * limit)
          .sort(sortObj)
          .limit(limit);
      const total = await postModel.countDocuments(query);
      const showList = post.map(p => {
          return {
              title: p.title,
              price: p.price,
              priceUnit: p.priceUnit,
              area: p.area,
              areaUnit: p.areaUnit,
              introduce: p.introduce,
              images: p.images,
              address: p.address,
              url: p.url,
              bedrooms: p.bedrooms,
              toilets: p.toilets,
              code: p.code,
              vipPostType: p.vipPostType,
              postedAt: p.postedAt,
              slug: p.slug
          }
      })
      return res.status(HttpStatus.OK).json({
          total: total,
          posts: showList
      })
  }catch (e){
      console.log(e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: JSON.stringify(e)
      })
  }
};

module.exports = {
    getListPosts
};
