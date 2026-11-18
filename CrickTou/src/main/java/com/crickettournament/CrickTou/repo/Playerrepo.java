
package com.crickettournament.CrickTou.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.crickettournament.CrickTou.model.Player;

public interface Playerrepo extends JpaRepository<Player, Long> {

    List<Player> findByTeamIgnoreCase(String team);

    boolean existsByNameIgnoreCaseAndTeamIgnoreCase(
            String name, String team);
    
    boolean existsByNameIgnoreCaseAndTeamIgnoreCaseAndIdNot(
            String name, String team, Long id);
}