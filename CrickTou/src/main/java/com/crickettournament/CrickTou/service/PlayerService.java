
package com.crickettournament.CrickTou.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.crickettournament.CrickTou.exception.DuplicateResourceException;
import com.crickettournament.CrickTou.exception.ResourceNotFoundException;
import com.crickettournament.CrickTou.model.Player;
import com.crickettournament.CrickTou.repo.Playerrepo;

@Service
@Transactional
public class PlayerService {

    private final Playerrepo playerRepository;

    // Constructor injection
    public PlayerService(Playerrepo playerRepository) {
        this.playerRepository = playerRepository;
    }

    // Create player
    public Player createPlayer(Player player) {

        checkDuplicatePlayer(
                player.getName(),
                player.getTeam(),
                null
        );

        // Ensure a new player is created
        player.setId(null);

        return playerRepository.save(player);
    }

    // Get all players
    @Transactional(readOnly = true)
    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    // Get player by ID
    @Transactional(readOnly = true)
    public Player getPlayerById(Long id) {

        return playerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Player not found with ID: " + id
                        )
                );
    }

    // Get players by team
    @Transactional(readOnly = true)
    public List<Player> getPlayersByTeam(String team) {
        return playerRepository.findByTeamIgnoreCase(team);
    }

    // Update player
    public Player updatePlayer(Long id, Player details) {

        Player existing = getPlayerById(id);

        checkDuplicatePlayer(
                details.getName(),
                details.getTeam(),
                id
        );

        existing.setName(details.getName());
        existing.setAge(details.getAge());
        existing.setRole(details.getRole());
        existing.setTeam(details.getTeam());
        existing.setBattingStyle(details.getBattingStyle());

        return playerRepository.save(existing);
    }

    // Delete player
    public void deletePlayer(Long id) {

        Player existing = getPlayerById(id);

        playerRepository.delete(existing);
    }

    // Check duplicate player name within the same team
    private void checkDuplicatePlayer(
            String name,
            String team,
            Long excludePlayerId) {

        boolean duplicate;

        if (excludePlayerId == null) {

            // Creating a new player
            duplicate = playerRepository
                    .existsByNameIgnoreCaseAndTeamIgnoreCase(
                            name, team
                    );

        } else {

            // Updating: exclude the current player's ID
            duplicate = playerRepository
                    .existsByNameIgnoreCaseAndTeamIgnoreCaseAndIdNot(
                            name, team, excludePlayerId
                    );
        }

        if (duplicate) {
            throw new DuplicateResourceException(
                    "A player with this name is already registered in this team."
            );
        }
    }
}


