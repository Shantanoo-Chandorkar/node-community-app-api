`use strict`;
const Role = require("../models/roleModel");

// @desc create role route
// POST /v1/role

const createRoleController = async (req, res) => {
  try {
    const { name } = req.body;

    // input validation
    if (!name) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "name",
            message: "Name should be at least 2 characters.",
            code: "INVALID_INPUT",
          },
        ],
      });
    }

    // check role
    const existingRole = await Role.findOne({ name });

    // existing role found
    if (existingRole) {
      return res.status(400).send({
        status: false,
        errors: [
          {
            param: "name",
            message: "Role with this name already exists.",
            code: "RESOURCE_EXISTS",
          },
        ],
      });
    }

    // create role
    const role = await new Role({
      name: name,
    }).save();

    // response
    res.status(201).send({
      status: true,
      content: {
        data: {
          id: role._id,
          name: role.name,
          created_at: role.createdAt,
          updated_at: role.updatedAt,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: false,
      errors: [
        {
          param: "role",
          message: "Name should be at least 2 characters.",
          code: "INVALID_INPUT",
        },
      ],
    });
  }
};

const getRolesController = async (req, res) => {
  try {
    const roles = await Role.find({});
    // console.log(roles);

    let page = 1,
      perPage = 10;
    const { meta } = await getRolePaginationData(page, perPage);
    // console.log(meta);

    res.status(200).send({
      status: true,
      content: {
        meta: meta,
        data: roles,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      errors: [
        {
          param: "role",
          message: "Error fetching roles",
          code: "SERVER_ERROR",
        },
      ],
    });
  }
};

const getRolePaginationData = async (page, perPage) => {
  try {
    const itemsPerPage = parseInt(perPage, 10) || 10;

    const roles = await Role.find({})
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    // total number of documents/roles
    const totalRoles = await Role.find({}).estimatedDocumentCount();

    // total number of pages
    const totalPages = Math.ceil(totalRoles / itemsPerPage);

    // current page number
    if (roles.length > itemsPerPage) {
      page = Math.ceil(
        (roles.length + (page - 1) * itemsPerPage) / itemsPerPage
      );
    }

    return {
      meta: {
        total: totalRoles,
        pages: totalPages,
        page: page,
      },
    };
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createRoleController, getRolesController };
