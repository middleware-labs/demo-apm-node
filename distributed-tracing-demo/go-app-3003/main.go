package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	track "github.com/middleware-labs/golang-apm/tracker"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

func main() {
	config, _ := track.Track(
		track.WithConfigTag("service", "missing-go-app-3003"),
		track.WithConfigTag("projectName", "distributed-tracing-demo"),
		track.WithConfigTag("accessToken", "<MW_API_KEY>"),
		track.WithConfigTag("target", "<MW_UID>.middleware.io:443"),
	)
	tp := config.Tp

	r := gin.Default()
	r.Use(otelgin.Middleware("gin-server-3003", otelgin.WithTracerProvider(tp)))

	r.GET("/endpoint", func(c *gin.Context) {
		fmt.Println("request recieved 4")
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello from Go Gin App!",
		})
	})

	r.Run(":3003")
}
