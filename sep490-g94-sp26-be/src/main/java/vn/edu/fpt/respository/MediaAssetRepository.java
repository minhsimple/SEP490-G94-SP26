package vn.edu.fpt.respository;

import vn.edu.fpt.entity.MediaAsset;
import vn.edu.fpt.util.enums.MediaAssetOwnerType;

import java.util.List;
import java.util.Set;

public interface MediaAssetRepository extends BaseRepository<MediaAsset, Integer> {
    List<MediaAsset> findMediaAssetByOwnerIdAndOwnerType(Integer ownerId, MediaAssetOwnerType ownerType);
    List<MediaAsset> findAllByOwnerIdInAndOwnerType(Set<Integer> ids, MediaAssetOwnerType mediaAssetOwnerType);
    void deleteByOwnerIdAndOwnerType(Integer ownerId, MediaAssetOwnerType ownerType);
}
