const mongoose = require('mongoose');
const postModel = require('../models/post.model');
const HttpStatus = require('http-status-codes');
const POST_COLUMNS = Object.keys(postModel.schema.paths);
POST_COLUMNS.pop();
const fields = ["city", "district", "ward", "street"];
const POST_TYPE = require('../constant/post-type');
const VIP_TYPE = require('../constant/vip-type');
const postTypeIds = POST_TYPE.map(type => type.id);
const vipTypeSNumber = Object.values(VIP_TYPE).map(numb => numb.toString());
const testInputData = (str) => {
    return /[a-zA-Z0-9]/.test(str);
};

const extractQueryObject = (str, res) => {
    let {projectId, postType, vipPostType} = str;
    let query = {};
    if (projectId) {
        if (!testInputData(projectId)) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Input data not match"
            });
            return false;
        }

        if (projectId.length !== 24) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Input data not match'
            });

            return false;
        }

        query.projectId = projectId;
    }

    for (let i = 0; i < fields.length; i++) {
        if (str[fields[i]]) {
            if (!testInputData(str[fields[i]])) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: "Input data not match"
                });

                return false;
            }

            query[fields[i]] = str[fields[i]];
        }
    }


    if (postType) {
        if (postTypeIds.indexOf(postType) === -1) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Input data not match"
            });

            return false;
        }

        query.postType = parseInt(postType);
    }

    if (vipPostType) {
        if (vipTypeSNumber.indexOf(vipPostType) === -1) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Input data not match"
            });

            return false;
        }

        query.vipPostType = parseInt(vipPostType);
    }

    return query;
};

const extractSortObject = (str, res) => {
    let {sortBy, sortDirection} = str;
    if (!testInputData(sortBy)) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Input data not match"
        });

        return false;
    }

    if (!testInputData(sortDirection)) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Input data not match"
        });

        return false;
    }

    if (!sortBy) {
        sortBy = "vipPostType";
    } else {
        if (POST_COLUMNS.indexOf(sortBy) === -1) {
            sortBy = "vipPostType";
        }
    }

    if (!sortDirection) {
        sortDirection = "desc";
    } else {
        if (["asc", "desc"].indexOf(sortDirection) === -1) {
            sortDirection = "desc";
        }
    }

    const sortObj = {};
    sortObj[sortBy] = sortDirection === "desc" ? -1 : 1;
    return sortObj;

};

const extractPagination = (str, res) => {
    let {limit, page} = str;
    let pagination = {};
    if (limit !== undefined) {
        if (!/[0-9]+/.test(limit)) {
            pagination.limit = 10;
        }

        if (isNaN(limit)) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Input data not match"
            });

            return false;
        } else {
            pagination.limit = parseInt(limit);
        }
    } else {
        pagination.limit = 10;
    }
    if (page !== undefined) {
        if (!/[0-9]+/.test(page)) {
            pagination.page = 0;
        }

        if (isNaN(page)) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Input data not match"
            });

            return false;
        } else {
            pagination.page = parseInt(page);
        }
    } else {
        pagination.page = 0;
    }

    return pagination;
};

const getListPosts = async (req, res) => {
    try {
        const pagination = extractPagination(req.query, res);
        if (pagination === false) {
            return;
        }

        const query = extractQueryObject(req.query, res);
        if (query === false) {
            return;
        }

        const sortObj = extractSortObject(req.query, res);
        if (sortObj === false) {
            return;
        }
        const post = await postModel.find(query)
            .skip(pagination.page * pagination.limit)
            .sort(sortObj)
            .limit(pagination.limit);
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
        });

        return res.status(HttpStatus.OK).json({
            total: total,
            posts: showList
        })
    } catch (e) {
        console.log(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: JSON.stringify(e)
        })
    }
};

module.exports = {
    getListPosts
};
