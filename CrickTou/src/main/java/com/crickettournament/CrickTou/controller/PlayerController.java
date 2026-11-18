
package com.crickettournament.CrickTou.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.crickettournament.CrickTou.model.Player;
import com.crickettournament.CrickTou.service.PlayerService;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @PostMapping
    public ResponseEntity<Player> createPlayer(
            @Valid @RequestBody Player player) {

        Player saved = playerService.createPlayer(player);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<Player>> getAllPlayers() {
        return ResponseEntity.ok(playerService.getAllPlayers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Player> getPlayerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(playerService.getPlayerById(id));
    }

    @GetMapping("/team/{team}")
    public ResponseEntity<List<Player>> getPlayersByTeam(
            @PathVariable String team) {

        return ResponseEntity.ok(playerService.getPlayersByTeam(team));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Player> updatePlayer(
            @PathVariable Long id,
            @Valid @RequestBody Player player) {

        return ResponseEntity.ok(
                playerService.updatePlayer(id, player));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(
            @PathVariable Long id) {

        playerService.deletePlayer(id);
        return ResponseEntity.noContent().build();
    }
}
