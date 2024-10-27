package com.subway.service;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.subway.domain.Member;
import com.subway.domain.Role;
import com.subway.persistence.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginService {
	private final MemberRepository mr;
	private final PasswordEncoder enc;

	// 프론트에서 받은 토큰으로 멤버 id 반환
	public String getUserIDFromToken() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && authentication.isAuthenticated()) {
			return authentication.getName();
		}
		return null;
	}

	// 회원가입
	public void signup(Member m) {
		mr.save(Member.builder()
				.userid(m.getUserid())
				.password(enc.encode(m.getPassword()))
				.nickname(m.getNickname())
				.role(Role.ROLE_MEMBER).build());
	}

	// 중복 아이디 체크
	public ResponseEntity<?> checkID(Member m) {
		if (mr.findById(m.getUserid()).isPresent())
			return ResponseEntity.status(HttpStatus.CONFLICT).body("중복된 ID");
		else
			return ResponseEntity.ok("사용 가능한 ID");
	}
	
	// OAuth2.0 로그인 시 유저 검증
	public ResponseEntity<?> checkOAuth() {
	    String userid = getUserIDFromToken();
	    Optional<Member> mem = mr.findById(userid);

	    if (mem.isPresent()) {
	        String password = mem.get().getPassword();
	        
	        // 초기 비밀번호와 일치하는지 확인
	        if (enc.matches("1a2s1a2s3d4f3d4f", password)) {
	            // 초기 비밀번호인 경우, 비밀번호 변경 필요
	            return ResponseEntity.accepted().body("첫 로그인이므로 비밀번호 변경이 필요합니다.");
	        } else {
	            // 비밀번호가 다를 경우, 로그인 성공
	            return ResponseEntity.status(HttpStatus.OK).body(userid);
	        }
	    }
	    
	    // 사용자 정보가 없을 경우
	    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다.");
	}

}
