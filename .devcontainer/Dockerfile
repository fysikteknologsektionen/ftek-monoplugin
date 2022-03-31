FROM 'wordpress'

RUN set -ex; \
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get update; \
    apt-get install -y \
        nodejs \
        git \
        gettext \
        sudo \
    ;

RUN set -ex; \
    EXPECTED_CHECKSUM="$(php -r 'copy("https://composer.github.io/installer.sig", "php://stdout");')"; \
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"; \
    ACTUAL_CHECKSUM="$(php -r "echo hash_file('sha384', 'composer-setup.php');")"; \
    [ "$EXPECTED_CHECKSUM" = "$ACTUAL_CHECKSUM" ]; \
    php composer-setup.php; \
    rm composer-setup.php; \
    mv composer.phar /usr/local/bin/composer;

RUN useradd --create-home --shell /bin/bash --groups sudo wordpress;