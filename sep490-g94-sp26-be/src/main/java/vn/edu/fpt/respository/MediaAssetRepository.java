package vn.edu.fpt.respository;

import vn.edu.fpt.entity.MediaAsset;
import vn.edu.fpt.util.enums.MediaAssetOwnerType;

import java.util.List;

public interface MediaAssetRepository extends BaseRepository<MediaAsset, Integer> {
    List<MediaAsset> findMediaAssetByOwnerIdAndOwnerType(Integer ownerId, MediaAssetOwnerType ownerType);
}
