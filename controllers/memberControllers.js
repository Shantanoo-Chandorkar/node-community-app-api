const Member = require("../models/memberModel");
const User = require("../models/userModel");
const Community = require("../models/communityModel");
const Role = require("../models/roleModel");

// @desc create member route
// POST /v1/member
const addMemberController = async (req, res) => {
  try {
    const { community, user, role } = req.body;

    // input validation
    if (!community || !user || !role) {
      return res.status(400).send({
        status: false,
        errors: [
          {
            param: "input",
            message: "Invalid input.",
            code: "INVALID_INPUT",
          },
        ],
      });
    }

    // user not found
    const userData = await User.findById({ _id: user });
    if (!userData) {
      return res.status(400).send({
        status: false,
        errors: [
          {
            param: "user",
            message: "User not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }

    // community not found
    const communityData = await Community.findById({ _id: community });
    if (!communityData) {
      return res.status(400).send({
        status: false,
        errors: [
          {
            param: "community",
            message: "Community not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }

    // role not found
    const roleData = await Role.findById({ _id: role });
    if (!roleData) {
      return res.status(400).send({
        status: false,
        errors: [
          {
            param: "role",
            message: "Role not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }

    // member already exist
    const existMember = await Member.findOne({ user, community, role });

    if (existMember) {
      return res.status(400).send({
        status: false,
        errors: [
          {
            message: "User is already added in the community.",
            code: "RESOURCE_EXISTS",
          },
        ],
      });
    }

    // add member
    const members = new Member({
      user,
      community,
      role,
    });

    await members.save();
    res.status(201).send({
      status: true,
      content: {
        data: members,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      errors: [
        {
          param: "server",
          message: "Error creating member.",
          code: "SERVER_ERROR",
        },
      ],
    });
  }
};

// @desc delete member route
// DELETE /v1/member
const deleteMemberController = async (req, res) => {
  try {
    const { id } = req.params;

    // member exist
    const existMember = await Member.findOne({ user: id });

    if (!existMember) {
      return res.status(400).send({
        status: false,
        errors: [
          {
            message: "Member not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }

    // delete data
    await Member.findByIdAndDelete(id);

    // response
    res.status(200).send({
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      errors: [
        {
          param: "server",
          message: "Error deleting member.",
          code: "SERVER_ERROR",
        },
      ],
    });
  }
};

module.exports = { addMemberController, deleteMemberController };
