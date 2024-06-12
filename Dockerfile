FROM dirigiblelabs/dirigible:latest

COPY alien_service/gen/api target/dirigible/repository/root/registry/public/alien_service/gen/api
COPY alien_service/gen/dao target/dirigible/repository/root/registry/public/alien_service/gen/dao
COPY alien_service/gen/odata target/dirigible/repository/root/registry/public/alien_service/gen/odata
COPY alien_service/gen/schema target/dirigible/repository/root/registry/public/alien_service/gen/schema
COPY alien_service/gen/alien.openapi target/dirigible/repository/root/registry/public/alien_service/gen/alien.openapi

ENV DIRIGIBLE_HOME_URL=/services/web/codbex-petstore/gen/index.html
