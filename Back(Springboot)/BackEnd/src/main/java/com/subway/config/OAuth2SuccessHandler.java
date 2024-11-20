package com.subway.config;

import java.io.IOException;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.subway.domain.Member;
import com.subway.domain.Role;
import com.subway.persistence.MemberRepository;
import com.subway.service.RandomNicknameService;
import com.subway.util.OAuthUtil;
import com.subway.util.JWTUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
	private final MemberRepository mr;
	private final PasswordEncoder enc;
	private final RandomNicknameService rns;
	
	@Value("${oauth.google.redirect.url}")
	private String googleUrl;

	// OAuth 로그인 성공 시 호출되는 메서드 
	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		log.info("OAuth2SuccessHandler:onAuthenticationSuccess");
		// 인증된 사용자의 정보를 가져옴 authentication.getPrincipal();
		OAuth2User user = (OAuth2User) authentication.getPrincipal();
		// 임의의 사용자를 만들어서 서버에 저장 (OAuthUtil의 인증된 사용자 정보를 인자에 넣어서 Name을 가져와서 userName에 저장 
		String userName = OAuthUtil.getUsernameFromOAuth2User(user);

		// 인증 정보 식별에 실패했으면 username을 가져올 수 없을 경우 예외 처리 
		if (userName == null) {
			log.error("OAuth 유저를 생성 할 수 없습니다.");
			throw new ServletException("OAuth 유저를 생성 할 수 없습니다.");
		}

		log.info("onAuthenticationSuccess:" + userName);

		// 인증 정보 식별 성공 후 해당 OAuth에 대한 정보가 DB에 없으면, 해당 OAuth 유저 정보를 DB에 저장 
		if (!mr.findById(userName).isPresent()) {
			try {
				mr.save(Member.builder()
						.userid(userName)
						.nickname(rns.makeRandomNickname())
						.password(enc.encode("1a2s1a2s3d4f3d4f"))
						.regidate(new Date())
						.role(Role.ROLE_MEMBER)
						.enabled(1)
						.build());
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		// 토큰값을 뽑아옴 "Bearer " 7자리 빼고 뒷자리의 Token 정보
		String jwtToken = JWTUtil.getJWT(userName).substring(7);
		
		// 배포용 연결
//		response.sendRedirect("http://58.235.21.221:4000/checkToken?token=" + jwtToken);
		// 로컬(개발용) 연결 
		response.sendRedirect(googleUrl + "/checkToken?token=" + jwtToken);
		// OAuth 로그인 성공 시, 클라이언트를 이 토큰을 포함한 주소로 리다이렉트(이 url을 브라우저에서 위치 시킴)
	}
}
