const mongoose = require('mongoose');
const postModel = require('../models/post.model');
const HttpStatus = require('http-status-codes');
const POST_COLUMNS = Object.keys(postModel.schema.paths);
const indexOf__v = POST_COLUMNS.indexOf("__v");
POST_COLUMNS.splice(indexOf__v, 1);
const addressFields = ["city", "district", "ward", "street"];
const POST_TYPE = require('../constant/post-type');
const VIP_TYPE = require('../constant/vip-type');
const postTypeIds = POST_TYPE.map(type => type.id);
const vipTypeSNumber = Object.values(VIP_TYPE).map(numb => numb.toString());
const isAlphabetAndNumber = (str) => {
    return /[-a-zA-Z0-9]+/.test(str);
};

const isNumberRegex = (number) => {
    return /[0-9]+/.test(number);
};

const extractQueryObject = (str, res) => {
    let {projectId, postType, vipPostType, minArea, maxArea} = str;
    let query = {};
    let area = {};

    if (minArea !== undefined) {
        if (!isNumberRegex(minArea)) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error invalid number"
            });

            return false;
        }

        if (minArea <= 0) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error invalid number"
            });

            return false;
        }

        area.$gte = parseInt(minArea);
        query.area = area;
    }

    if (maxArea !== undefined) {
        if (!isNumberRegex(maxArea)) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error invalid number"
            });

            return false;
        }

        if (area.$gte !== undefined && maxArea <= minArea) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error invalid number"
            });

            return false;
        }

        area.$lte = parseInt(maxArea);
        query.area = area;
    }

    if (projectId) {
        if (!isAlphabetAndNumber(projectId)) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error invalid alphabet and number "
            });
            return false;
        }

        if (projectId.length !== 24) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error invalid object id length"
            });

            return false;
        }

        query.projectId = projectId;
    }

    for (let i = 0; i < addressFields.length; i++) {
        if (str[addressFields[i]]) {
            if (!isAlphabetAndNumber(str[addressFields[i]])) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: "Error invalid alphabet and number"
                });

                return false;
            }

            query[addressFields[i]] = str[addressFields[i]];
        }
    }


    if (postType) {
        if (postTypeIds.indexOf(postType) === -1) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error invalid number"
            });

            return false;
        }

        query.postType = parseInt(postType);
    }

    if (vipPostType) {
        if (vipTypeSNumber.indexOf(vipPostType) === -1) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error invalid number"
            });

            return false;
        }

        query.vipPostType = parseInt(vipPostType);
    }

    return query;
};

const extractSortObject = (str, res) => {
    let {sortBy, sortDirection} = str;
    if (!isAlphabetAndNumber(sortBy)) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error invalid alphabet and number"
        });

        return false;
    }

    if (!isAlphabetAndNumber(sortDirection)) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error invalid alphabet and number"
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
        if (isNaN(limit)) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error invalid number"
            });

            return false;
        }

        if (!isNumberRegex(limit)) {
            pagination.limit = 10;
        } else {
            pagination.limit = parseInt(limit);
        }

    } else {
        pagination.limit = 10;
    }

    if (page !== undefined) {
        if (isNaN(page)) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error invalid number"
            });

            return false;
        }

        if (!isNumberRegex(page)) {
            pagination.page = 0;
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

const getDetailPost = async (req, res) => {
    try {
        const slug = req.params.slug;
        if (!isAlphabetAndNumber(slug)) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Error invalid alphabet and number"
            });
        }

        const detailPost = await postModel.findOne({slug: slug})
            .select("-_id -createdAt -updatedAt -__v");
        if (!detailPost) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: "Không tìm thấy"
            })
        }

        return res.status(HttpStatus.OK).json(detailPost);
    } catch (e) {
        console.log(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: JSON.stringify(e)
        });
    }
};

const getStatisticPost = async (req, res) => {
    try {
        const statistics = await postModel.aggregate([
            {
                $group: {
                    _id: "$city",
                    count: {$sum: 1}
                }
            },
            {
                $sort: {count: -1}
            }
        ])

        return res.status(HttpStatus.OK).json(statistics);
    } catch (e) {
        console.log(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: JSON.stringify(e)
        });
    }
};

module.exports = {
    getListPosts,
    getDetailPost,
    getStatisticPost,
    isNumberRegex,
    extractPagination
};
