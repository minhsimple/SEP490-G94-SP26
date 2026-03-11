package vn.edu.fpt.respository;

import vn.edu.fpt.entity.MediaAsset;

import java.util.List;

public interface MediaAssetRepository extends BaseRepository<MediaAsset, Integer> {
    List<MediaAsset> findMediaAssetByOwnerId(Integer ownerId);
}
