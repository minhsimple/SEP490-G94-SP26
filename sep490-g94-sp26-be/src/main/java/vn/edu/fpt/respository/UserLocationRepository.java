package vn.edu.fpt.respository;

import vn.edu.fpt.entity.UserLocation;
import vn.edu.fpt.util.enums.RecordStatus;
import java.util.List;
import java.util.Set;

public interface UserLocationRepository extends BaseRepository<UserLocation, Integer> {
    List<UserLocation> findAllByUserId(Integer userId);

    List<UserLocation> findByLocationId(Integer locationId);

    void deleteByUserIdAndLocationIdNotIn(Integer userId, Set<Integer> locationIds);

    UserLocation findByUserId(Integer id);
}
