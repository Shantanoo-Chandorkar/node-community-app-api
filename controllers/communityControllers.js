`use strict`;
const Community = require("../models/communityModel");
const Member = require("../models/memberModel");
const slugify = require("slugify");

// @desc create community route
// POST /v1/community
const createCommunityController = async (req, res) => {
  try {
    console.log(req.user);
    const { id } = req.user;
    const { name } = req.body;

    // input validation
    if (!name || name.length <= 2) {
      return res.status(400).send({
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

    const slugToName = slugify(name, { replacement: "-", lower: true });

    // existing community
    const existCommunity = await Community.findOne({ slug: slugToName });

    if (existCommunity) {
      return res.status(400).send({
        status: false,
        errors: [
          {
            param: "name",
            message: "Community with this name already exists.",
            code: "RESOURCE_EXISTS",
          },
        ],
      });
    }

    // create community
    const communities = new Community({
      name: name,
      owner: id,
      slug: slugToName,
    });

    await communities.save();

    // response
    res.status(201).send({
      status: true,
      content: {
        data: {
          id: communities._id,
          name: communities.name,
          slug: communities.slug,
          owner: communities.owner,
          created_at: communities.createdAt,
          updated_at: communities.updatedAt,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      errors: [
        {
          param: "server",
          message: "Error creating community.",
          code: "SERVER_ERROR",
        },
      ],
    });
  }
};

// @desc get all community route
// GET /v1/community
const getAllCommunitiesController = async (req, res) => {
  try {
    let page = 1,
      perPage = 10;
    const itemsPerPage = parseInt(perPage, 10) || 10;

    const community = await Community.find({})
      .populate({
        path: "owner",
        select: "_id name",
      })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    // pagination
    const { meta } = await getAllCommunityPagination(page, perPage);

    // response object
    res.status(200).send({
      status: true,
      content: {
        meta: meta,
        data: community,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      errors: [
        {
          param: "server",
          message: "Error fetching communities.",
          code: "SERVER_ERROR",
        },
      ],
    });
  }
};

// @desc get all members route
// GET /v1/community/:id/members
const getAllMembersController = async (req, res) => {
  try {
    const { id } = req.params;
    let page = 1,
      perPage = 10;
    const itemsPerPage = parseInt(perPage, 10) || 10;

    const communityMembers = await Member.find({ community: id })
      .populate([
        { path: "user", select: "_id name" },
        { path: "role", select: "_id name" },
      ])
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    // pagination
    const { meta } = await getAllMemberPagination(page, perPage, id);

    // response object
    res.status(201).send({
      status: true,
      content: {
        meta: meta,
        data: communityMembers,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      errors: [
        {
          param: "server",
          message: "Error creating community.",
          code: "SERVER_ERROR",
        },
      ],
    });
  }
};

// @desc get my owned community route
// GET /v1/community/me/owner
const getMyOwnedCommunityController = async (req, res) => {
  try {
    const { id } = req.user;
    let page = 1,
      perPage = 10;
    const itemsPerPage = parseInt(perPage, 10) || 10;

    // owned community
    const ownedCommunities = await Community.find({ owner: id })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    // existing owned community
    if (!ownedCommunities) {
      return res.status(200).send({
        status: true,
        message: "You don't own any community.",
      });
    }

    // pagination
    const { meta } = await getMyOwnedCommunityPagination(page, perPage, id);

    res.status(200).send({
      status: true,
      content: {
        meta: meta,
        data: ownedCommunities,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      errors: [
        {
          param: "server",
          message: "Error creating community.",
          code: "SERVER_ERROR",
        },
      ],
    });
  }
};

// @desc get my joined community route
// GET /v1/community/me/member
const getMyJoinedCommunityController = async (req, res) => {
  try {
    const { id } = req.user;
    let page = 1,
      perPage = 10;
    const itemsPerPage = parseInt(perPage, 10) || 10;

    // joined community
    const joinedCommunity = await Member.find({ user: id })
      .populate({
        path: "community",
        populate: {
          path: "owner",
          model: "User",
          select: "_id name",
        },
      })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    // existing joined community
    if (!joinedCommunity) {
      return res.status(200).send({
        status: true,
        message: "You have not joined a community yet.",
      });
    }

    const communities = joinedCommunity.map((member) => member.community);

    // pagination
    const { meta } = await getMyJoinedCommunityPagination(page, perPage, id);

    res.status(201).send({
      status: true,
      content: {
        meta: meta,
        data: communities,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      errors: [
        {
          param: "server",
          message: "Error creating community.",
          code: "SERVER_ERROR",
        },
      ],
    });
  }
};

const getAllMemberPagination = async (page, perPage, id) => {
  try {
    const itemsPerPage = parseInt(perPage, 10) || 10;

    const members = await Member.find({ community: id })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    // total number of documents/members
    const totalMembers = await Member.find({
      community: id,
    }).estimatedDocumentCount();

    // total number of pages
    const totalPages = Math.ceil(totalMembers / itemsPerPage);

    // Increment the page value if needed
    while (members.length > itemsPerPage && page < totalPages) {
      page++;
      const newSkip = (page - 1) * itemsPerPage;
      members = await Member.find().skip(newSkip).limit(itemsPerPage).exec();
    }

    return {
      meta: {
        total: totalMembers,
        pages: totalPages,
        page: page,
      },
    };
  } catch (error) {
    console.log(error);
  }
};

const getAllCommunityPagination = async (page, perPage) => {
  try {
    const itemsPerPage = parseInt(perPage, 10) || 10;

    const communities = await Community.find({})
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    // total number of documents/communities
    const totalCommunities = await Community.find({}).estimatedDocumentCount();

    // total number of pages
    const totalPages = Math.ceil(totalCommunities / itemsPerPage);

    // Increment the page value if needed
    while (communities.length > itemsPerPage && page < totalPages) {
      page++;
      const newSkip = (page - 1) * itemsPerPage;
      communities = await Member.find()
        .skip(newSkip)
        .limit(itemsPerPage)
        .exec();
    }

    return {
      meta: {
        total: totalCommunities,
        pages: totalPages,
        page: page,
      },
    };
  } catch (error) {
    console.log(error);
  }
};

const getMyOwnedCommunityPagination = async (page, perPage, id) => {
  try {
    const itemsPerPage = parseInt(perPage, 10) || 10;

    const ownedCommunities = await Community.find({ owner: id })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    // total number of documents/ownedCommunities
    const totalCommunities = await Community.find({
      owner: id,
    }).estimatedDocumentCount();

    // total number of pages
    const totalPages = Math.ceil(totalCommunities / itemsPerPage);

    // Increment the page value if needed
    while (ownedCommunities.length > itemsPerPage && page < totalPages) {
      page++;
      const newSkip = (page - 1) * itemsPerPage;
      ownedCommunities = await Community.find({ owner: id })
        .skip(newSkip)
        .limit(itemsPerPage)
        .exec();
    }

    return {
      meta: {
        total: totalCommunities,
        pages: totalPages,
        page: page,
      },
    };
  } catch (error) {
    console.log(error);
  }
};

const getMyJoinedCommunityPagination = async (page, perPage, id) => {
  try {
    const itemsPerPage = parseInt(perPage, 10) || 10;

    const joinedCommunity = await Member.find({ user: id })
      .populate({
        path: "community",
        populate: {
          path: "owner",
          model: "User",
          select: "_id name",
        },
      })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    // total number of documents/joinedCommunity
    const totalCommunities = await Community.find({
      user: id,
    })
      .populate({
        path: "community",
        populate: {
          path: "owner",
          model: "User",
          select: "_id name",
        },
      })
      .estimatedDocumentCount();

    // total number of pages
    const totalPages = Math.ceil(totalCommunities / itemsPerPage);

    // Increment the page value if needed
    while (joinedCommunity.length > itemsPerPage && page < totalPages) {
      page++;
      const newSkip = (page - 1) * itemsPerPage;
      joinedCommunity = await Community.find()
        .skip(newSkip)
        .limit(itemsPerPage)
        .exec();
    }

    return {
      meta: {
        total: totalCommunities,
        pages: totalPages,
        page: page,
      },
    };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createCommunityController,
  getAllCommunitiesController,
  getAllMembersController,
  getMyOwnedCommunityController,
  getMyJoinedCommunityController,
};
