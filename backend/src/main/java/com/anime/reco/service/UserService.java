package com.anime.reco.service;

import com.anime.reco.model.User;
import com.anime.reco.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User addFriend(Long userId, Long friendId) {
        User user = userRepository.findById(userId).orElseThrow();
        User friend = userRepository.findById(friendId).orElseThrow();

        Set<User> userFriends = user.getFriends();
        Set<User> friendFriends = friend.getFriends();

        userFriends.add(friend);
        friendFriends.add(user);

        userRepository.save(friend);
        return userRepository.save(user);
    }

    public User removeFriend(Long userId, Long friendId) {
        User user = userRepository.findById(userId).orElseThrow();
        User friend = userRepository.findById(friendId).orElseThrow();

        user.getFriends().remove(friend);
        friend.getFriends().remove(user);

        userRepository.save(friend);
        return userRepository.save(user);
    }

    public List<User> searchUsers(String username) {
        return userRepository.findTop15ByUsernameContainingIgnoreCase(username == null ? "" : username);
    }
}
