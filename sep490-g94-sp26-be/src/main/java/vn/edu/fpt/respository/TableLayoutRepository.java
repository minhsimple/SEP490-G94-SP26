package vn.edu.fpt.respository;

import vn.edu.fpt.entity.TableLayout;

import java.util.List;

public interface TableLayoutRepository extends BaseRepository<TableLayout, Integer> {
    List<TableLayout> findAllByContractId(Integer id);
    void deleteByContractId(Integer id);
}
