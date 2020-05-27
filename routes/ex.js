const listUser = async (req, res) => {
    try {
        let { limit, page, name, email, action } = req.query;
        const user = req.user;

        if (!/[0-9]+/.test(limit)) {
            limit = 10;
        } else {
            limit = parseInt(limit) || 10;
        }
        if (!/[0-9]+/.test(page)) {
            page = 1;
        } else {
            page = parseInt(page) || 1;
        }
        if (!action) {
            return res.status(400).json({
                message: 'API không hỗ trợ'
            });
        }
        if (action === 'FIND_CANDIDATE') {
            if (user.role !== 2) {
                return res.status(400).json({
                    message: 'Thao tác không hợp lệ'
                });
            }
            let query = { role: 1 };
            if (name) {
                query.name = name;
            }
            if (email) {
                if (!checkValidatorEmail(email)) {
                    return res.status(400).json({
                        message: 'Email không đúng định dạng'

                    });
                }
                query.email = email;
            }
            const users = await userModel.find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
            const total = await userModel.find(query).count();
            const userRole = users.map(user => {

                return { email: user.email, name: user.name };
            });
            return res.status(200).json({
                message: 'Thành công',
                data: {
                    totalItems: total,
                    candidates: userRole
                }
            });
        }
        return res.status(400).json({
            message: 'API không hỗ trợ'
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: JSON.stringify(err)
        });
    }
};
