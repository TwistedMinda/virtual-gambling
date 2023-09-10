// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract HateMe {
  uint256 constant MINIMUM_ENTRY = 0.001 ether;

  event BucketCreated(bytes, address);
  event Loved(bytes, uint amount);
  event Hated(bytes, uint amount);
  event Claimed(address, uint amount);

  error InsufficientEntry(uint256 required, uint256 provided);
  error BucketAlreadyExists(bytes slug);
  error BucketDoesNotExist(bytes slug);
  error StringMustBeLowerCase();
  error SlugMustBeAtLeast3Characters();
  error SlugMustBeAMaximumOf50Characters();
  error YouAreNotTheOwner();
  error NothingToClaim();
  
  struct Bucket {
    bytes slug;
    bool exists;
    uint hated;
    uint loved;
    uint gains;
    uint claimable;
    address owner;
  }

  struct Stats {
    uint totalGains;
    uint totalLoved;
    uint totalHated;
  }

  mapping (bytes => Bucket) public buckets;
  Stats public stats;

  /**
   * Create bucket
   */
  function createBucket(bytes memory slug) external onlyLowerCase(slug) {
    if (slug.length < 3) {
      revert SlugMustBeAtLeast3Characters();
    }
    if (slug.length > 50) {
      revert SlugMustBeAMaximumOf50Characters();
    }
    if (buckets[slug].exists) {
      revert BucketAlreadyExists(slug);
    }
    buckets[slug] = Bucket(slug, true, 0, 0, 0, 0, msg.sender);
    emit BucketCreated(slug, msg.sender);
  }

  /**
   * Hate someone
   */
  function hateYou(
    bytes memory slug
  ) external
    payable
    requireBucketExists(slug)
    requireMinimumEntry {
    buckets[slug].hated += 1;
    buckets[slug].gains += msg.value;
    buckets[slug].claimable += msg.value;
    stats.totalGains += msg.value;
    stats.totalHated += 1;
    emit Hated(slug, msg.value);
  }

  /**
   * Kidding, love someone
   */
  function kiddingILoveYou(
    bytes memory slug
  ) external
    payable
    requireBucketExists(slug)
    requireMinimumEntry {
    buckets[slug].loved += 1;
    buckets[slug].gains += msg.value;
    buckets[slug].claimable += msg.value;
    stats.totalGains += msg.value;
    stats.totalLoved += 1;
    emit Loved(slug, msg.value);
  }

  /**
   * Claim gains for slug
   */
  function claim(bytes memory slug) external onlyOwner(slug) {
    uint amount = buckets[slug].claimable;
    if (amount == 0) {
      revert NothingToClaim();
    }
    payable(msg.sender).transfer(amount);
    buckets[slug].claimable = 0;
    emit Claimed(msg.sender, amount);
  }

  /**
   * Modifiers
   */
  modifier onlyOwner(bytes memory slug) {
    _;
    if (buckets[slug].owner != msg.sender) {
      revert YouAreNotTheOwner();
    }
  }

  modifier onlyLowerCase(bytes memory str) {
    _;
    for (uint i = 0; i < str.length; i++) {
      if (str[i] >= 0x41 && str[i] <= 0x5A) {
        revert StringMustBeLowerCase();
      }
    }
  }

  modifier requireMinimumEntry() {
    _;
    if (msg.value < MINIMUM_ENTRY) {
      revert InsufficientEntry(MINIMUM_ENTRY, msg.value);
    }
  }

  modifier requireBucketExists(bytes memory slug) {
    _;
    if (!buckets[slug].exists) {
      revert BucketDoesNotExist(slug);
    }
  }
}